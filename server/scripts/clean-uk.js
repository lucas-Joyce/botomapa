// UK cleaning script (Phase 1, §1.3). Reads the raw wide constituency CSV + long
// candidate CSV for an election, joins on the GSS id, normalises party labels, and
// emits one array of the merged row shape (dataContract.md) to
// server/data/processed/<electionId>.json, plus an idMap alongside.
//
// Hard rule (§1.3 / DoD §1): assert exactly 650 rows and log unmatched ids on BOTH
// sides of the join. Assertions run BEFORE any write, so a bad join fails loudly
// (non-zero exit) rather than leaving a partial file on disk.
//
// Run:  npm --prefix server run clean:uk            (all elections)
//       npm --prefix server run clean:uk uk-2024    (one or more electionIds)

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
// Reuse the single source of truth for party identity (parties.js). This is a
// build-time script — the cross-dir import never reaches the served client bundle.
import { normalizeParty } from '../../client/src/config/parties.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_DIR = join(__dirname, '..', 'data', 'raw')
const PROCESSED_DIR = join(__dirname, '..', 'data', 'processed')
const EXPECTED_SEATS = 650

// Two header dialects, one core. 'ons' = old INGE snake_case (2015/2017 on 2017
// boundaries); 'hoc' = House of Commons Library Title-Case (2019/2024). Each maps
// the fields the row shape needs to that dialect's header names.
const SCHEMAS = {
  ons: {
    con:  { id: 'ons_id', name: 'constituency_name', region: 'region_name', country: 'country_name',
            electorate: 'electorate', validVotes: 'valid_votes', invalidVotes: 'invalid_votes',
            majority: 'majority', first: 'first_party', second: 'second_party' },
    cand: { id: 'ons_id', party: 'party_abbreviation', votes: 'votes', share: 'share', change: 'change' },
  },
  hoc: {
    con:  { id: 'ONS ID', name: 'Constituency name', region: 'Region name', country: 'Country name',
            electorate: 'Electorate', validVotes: 'Valid votes', invalidVotes: 'Invalid votes',
            majority: 'Majority', first: 'First party', second: 'Second party' },
    cand: { id: 'ONS ID', party: 'Party abbreviation', votes: 'Votes', share: 'Share', change: 'Change' },
  },
}

// Source files + boundary vintage per election. boundariesComparable is true only
// for the 2024-boundary set (§3.1) — the 2017-boundary elections do not join to it.
const SOURCES = {
  'uk-2015': { schema: 'ons', con: 'GE2015-constituency.csv', cand: 'GE2015-candidate.csv', comparable: false },
  'uk-2017': { schema: 'ons', con: 'GE2017-constituency.csv', cand: 'GE2017-candidate.csv', comparable: false },
  'uk-2019': { schema: 'hoc', con: 'HoC-GE2019-results-by-constituency.csv', cand: 'HoC-GE2019-results-by-candidate.csv', comparable: false },
  'uk-2024': { schema: 'hoc', con: 'HoC-GE2024-results-by-constituency.csv', cand: 'HoC-GE2024-results-by-candidate.csv', comparable: true },
}

// --- §1.4 hand-rolled CSV parser -------------------------------------------------
// Quote-aware, RFC-4180 subset: quotes protect commas, "" -> " (unescape), CRLF/LF
// row breaks, leading BOM stripped. No multi-line-field case exists in any source
// file (verified), so rows split on physical newlines. Returns string[][].
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1) // strip BOM
  const rows = []
  let row = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }   // "" -> literal "
      else if (c === '"') quoted = false                            // closing quote
      else field += c
    } else if (c === '"') {
      quoted = true                                                 // opening quote
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++                   // consume CRLF pair
      row.push(field); field = ''
      // Skip blank lines (trailing newline at EOF produces one).
      if (!(row.length === 1 && row[0] === '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  row.push(field)
  if (!(row.length === 1 && row[0] === '')) rows.push(row)
  return rows
}

// Parse a CSV into objects keyed by (trimmed) header name.
function parseCsvToObjects(text) {
  const matrix = parseCsv(text)
  const header = matrix[0].map(h => h.trim())
  return matrix.slice(1).map(cells => {
    const obj = {}
    for (let i = 0; i < header.length; i++) obj[header[i]] = cells[i]
    return obj
  })
}

// "" / undefined -> null; otherwise Number. Empty numeric cells become null.
const num = v => (v === undefined || v === '' ? null : Number(v))
const round4 = v => (v === null ? null : Math.round(v * 1e4) / 1e4)

// --- the join ------------------------------------------------------------------
async function cleanElection(electionId) {
  const src = SOURCES[electionId]
  if (!src) throw new Error(`Unknown electionId '${electionId}'`)
  const map = SCHEMAS[src.schema]

  const conRows  = parseCsvToObjects(await readFile(join(RAW_DIR, src.con), 'utf-8'))
  const candRows = parseCsvToObjects(await readFile(join(RAW_DIR, src.cand), 'utf-8'))

  // Group candidates by constituency id, normalising + SUMMING collisions (e.g.
  // Lab + Lab Co-op both -> LAB; every minor/independent -> OTH, summed into one).
  const candById = new Map()   // id -> Map<partyCode, {votes, share, change}>
  for (const r of candRows) {
    const id = r[map.cand.id]
    if (!id) continue
    const code = normalizeParty('uk', r[map.cand.party])
    if (!candById.has(id)) candById.set(id, new Map())
    const byParty = candById.get(id)
    const votes = num(r[map.cand.votes]) ?? 0
    const share = num(r[map.cand.share])
    const change = num(r[map.cand.change])
    if (byParty.has(code)) {
      const e = byParty.get(code)
      e.votes += votes
      e.share = e.share === null ? share : (share === null ? e.share : e.share + share)
      e.change = null   // change is ambiguous once two labels are summed
    } else {
      byParty.set(code, { votes, share, change })
    }
  }

  const rows = []
  const idMap = {}
  const partiesSeen = new Set()
  const conIds = new Set()

  for (const r of conRows) {
    const id = r[map.con.id]
    if (!id) continue
    conIds.add(id)

    const results = [...(candById.get(id)?.entries() ?? [])]
      .map(([party, v]) => ({ party, votes: v.votes, share: round4(v.share), change: round4(v.change) }))
      .sort((a, b) => b.votes - a.votes)
    results.forEach(x => partiesSeen.add(x.party))

    const electorate = num(r[map.con.electorate])
    const validVotes = num(r[map.con.validVotes])
    const majority   = num(r[map.con.majority])
    const secondRaw  = r[map.con.second]

    rows.push({
      constituencyId: id,
      constituencyName: r[map.con.name],
      region: r[map.con.region],
      country: r[map.con.country],
      electorate,
      validVotes,
      invalidVotes: num(r[map.con.invalidVotes]),
      turnout: electorate ? round4(validVotes / electorate) : null,
      winner: normalizeParty('uk', r[map.con.first]),
      runnerUp: secondRaw ? normalizeParty('uk', secondRaw) : null,
      majority,
      majorityShare: validVotes ? round4(majority / validVotes) : null,
      results,
      boundariesComparable: src.comparable,
      socio: null,
    })
    idMap[id] = id   // UK: source ons_id IS the GSS constituencyId (identity map)
  }

  // Unmatched on both sides of the join — log before asserting.
  const unmatchedCon = [...conIds].filter(id => !candById.has(id))
  const unmatchedCand = [...candById.keys()].filter(id => !conIds.has(id))
  if (unmatchedCon.length)  console.warn(`  ⚠ ${unmatchedCon.length} constituencies with no candidates:`, unmatchedCon.slice(0, 10))
  if (unmatchedCand.length) console.warn(`  ⚠ ${unmatchedCand.length} candidate-only ids (no constituency):`, unmatchedCand.slice(0, 10))

  // Hard gate — fail loudly, do not write a partial file.
  if (rows.length !== EXPECTED_SEATS) {
    throw new Error(`${electionId}: expected ${EXPECTED_SEATS} seats, got ${rows.length}`)
  }

  await writeFile(join(PROCESSED_DIR, `${electionId}.json`), JSON.stringify(rows))
  await writeFile(join(PROCESSED_DIR, `${electionId}.idMap.json`), JSON.stringify(idMap))

  const othCount = rows.reduce((n, r) => n + (r.results.some(x => x.party === 'OTH') ? 1 : 0), 0)
  console.log(`✓ ${electionId}: ${rows.length} seats · ${partiesSeen.size} parties (${[...partiesSeen].sort().join(',')}) · OTH in ${othCount} seats · unmatched ${unmatchedCon.length}/${unmatchedCand.length}`)
}

async function main() {
  // Prove on uk-2019 first (§1.3), then the rest. Explicit args override.
  const requested = process.argv.slice(2)
  const ids = requested.length ? requested : ['uk-2019', 'uk-2015', 'uk-2017', 'uk-2024']
  let failed = false
  for (const id of ids) {
    try {
      await cleanElection(id)
    } catch (err) {
      failed = true
      console.error(`✗ ${err.message}`)
    }
  }
  if (failed) process.exitCode = 1
}

main()
