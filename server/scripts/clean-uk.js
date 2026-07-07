// UK cleaning script (Phase 1, §1.3). For each election, reads the raw source
// CSV(s), joins/aggregates to one row per constituency, normalises party labels,
// and emits the merged row shape (dataContract.md) to
// server/data/processed/<electionId>.json, plus an idMap alongside.
//
// Two source layouts share one row-builder:
//   wide-long : a wide constituency CSV (totals, first/second party) + a long
//               candidate CSV (results[]), joined on the GSS id.  2015–2024.
//   notional  : a single long candidate-level CSV (parliament portal export) with
//               no wide file — constituency fields are derived by grouping, winner/
//               runner-up from `result position`.  uk-2019-notional (2024 bounds).
//
// Hard rule (§1.3 / DoD §1): assert exactly 650 rows and log unmatched ids on BOTH
// sides. Assertions run BEFORE any write, so a bad join fails loudly (non-zero
// exit) rather than leaving a partial file on disk.
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

// Header dialects for the wide-long layout. 'ons' = old INGE snake_case (2015/2017
// on 2017 boundaries); 'hoc' = House of Commons Library Title-Case (2019/2024).
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

// Column names for the notional long-only export (electionresults.parliament.uk).
const NOTIONAL = {
  id: 'Constituency geographic code', name: 'Constituency name',
  region: 'English region name', country: 'Country name',
  electorate: 'Electorate', validVotes: 'Election valid vote count', invalidVotes: 'Election invalid vote count',
  party: 'Main party abbreviation', votes: 'Candidate vote count', share: 'Candidate vote share',
  change: 'Candidate vote change', majority: 'Majority', pos: 'Candidate result position',
}

// Source files + boundary vintage per election. boundariesComparable is true only
// for the 2024-boundary set (§3.1) — the 2017-boundary elections do not join to it;
// notional-2019 shares the 2024 boundaries and is the swing baseline (§3.1).
const SOURCES = {
  'uk-2015': { layout: 'wide-long', schema: 'ons', con: 'GE2015-constituency.csv', cand: 'GE2015-candidate.csv', comparable: false },
  'uk-2017': { layout: 'wide-long', schema: 'ons', con: 'GE2017-constituency.csv', cand: 'GE2017-candidate.csv', comparable: false },
  'uk-2019': { layout: 'wide-long', schema: 'hoc', con: 'HoC-GE2019-results-by-constituency.csv', cand: 'HoC-GE2019-results-by-candidate.csv', comparable: false },
  'uk-2024': { layout: 'wide-long', schema: 'hoc', con: 'HoC-GE2024-results-by-constituency.csv', cand: 'HoC-GE2024-results-by-candidate.csv', comparable: true },
  'uk-2019-notional': { layout: 'notional', file: 'candidate-level-results-notional-general-election-12-12-2019.csv', comparable: true },
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
      if (!(row.length === 1 && row[0] === '')) rows.push(row)      // skip blank lines
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
async function readCsvObjects(file) {
  const matrix = parseCsv(await readFile(join(RAW_DIR, file), 'utf-8'))
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

// --- shared row-builder ----------------------------------------------------------
// Add one candidate to a per-constituency party tally, normalising the label and
// SUMMING collisions (Lab + Lab Co-op -> LAB; every minor/independent -> OTH).
function addCandidate(byParty, rawLabel, votes, share, change) {
  const code = normalizeParty('uk', rawLabel)
  if (byParty.has(code)) {
    const e = byParty.get(code)
    e.votes += votes
    e.share = e.share === null ? share : (share === null ? e.share : e.share + share)
    e.change = null   // change is ambiguous once two labels are summed
  } else {
    byParty.set(code, { votes, share, change })
  }
}

// Assemble one dataContract row from constituency fields + a party tally.
function deriveRow({ id, name, region, country, electorate, validVotes, invalidVotes,
                     majority, winnerRaw, runnerUpRaw, byParty, comparable }) {
  const results = [...byParty.entries()]
    .map(([party, v]) => ({ party, votes: v.votes, share: round4(v.share), change: round4(v.change) }))
    .sort((a, b) => b.votes - a.votes)
  return {
    constituencyId: id,
    constituencyName: name,
    region,
    country,
    electorate,
    validVotes,
    invalidVotes,
    turnout: electorate ? round4(validVotes / electorate) : null,
    winner: normalizeParty('uk', winnerRaw),
    runnerUp: runnerUpRaw ? normalizeParty('uk', runnerUpRaw) : null,
    majority,
    majorityShare: validVotes ? round4(majority / validVotes) : null,
    results,
    boundariesComparable: comparable,
    socio: null,
  }
}

// Unmatched logging + 650 assert + write + summary. `conIds` and `candKeys` are the
// id sets on each side of the join (equal for the notional layout).
async function finalize(electionId, rows, idMap, conIds, candKeys) {
  const unmatchedCon = [...conIds].filter(id => !candKeys.has(id))
  const unmatchedCand = [...candKeys].filter(id => !conIds.has(id))
  if (unmatchedCon.length)  console.warn(`  ⚠ ${unmatchedCon.length} constituencies with no candidates:`, unmatchedCon.slice(0, 10))
  if (unmatchedCand.length) console.warn(`  ⚠ ${unmatchedCand.length} candidate-only ids (no constituency):`, unmatchedCand.slice(0, 10))

  if (rows.length !== EXPECTED_SEATS) {
    throw new Error(`${electionId}: expected ${EXPECTED_SEATS} seats, got ${rows.length}`)
  }

  await writeFile(join(PROCESSED_DIR, `${electionId}.json`), JSON.stringify(rows))
  await writeFile(join(PROCESSED_DIR, `${electionId}.idMap.json`), JSON.stringify(idMap))

  const partiesSeen = new Set(rows.flatMap(r => r.results.map(x => x.party)))
  const othCount = rows.filter(r => r.results.some(x => x.party === 'OTH')).length
  console.log(`✓ ${electionId}: ${rows.length} seats · ${partiesSeen.size} parties (${[...partiesSeen].sort().join(',')}) · OTH in ${othCount} seats · unmatched ${unmatchedCon.length}/${unmatchedCand.length}`)
}

// --- wide-long layout (2015–2024) ------------------------------------------------
async function cleanWideLong(electionId, src) {
  const map = SCHEMAS[src.schema]
  const conRows = await readCsvObjects(src.con)
  const candRows = await readCsvObjects(src.cand)

  const candById = new Map()   // id -> Map<partyCode, {votes, share, change}>
  for (const r of candRows) {
    const id = r[map.cand.id]
    if (!id) continue
    if (!candById.has(id)) candById.set(id, new Map())
    addCandidate(candById.get(id), r[map.cand.party], num(r[map.cand.votes]) ?? 0, num(r[map.cand.share]), num(r[map.cand.change]))
  }

  const rows = [], idMap = {}, conIds = new Set()
  for (const r of conRows) {
    const id = r[map.con.id]
    if (!id) continue
    conIds.add(id)
    rows.push(deriveRow({
      id, name: r[map.con.name], region: r[map.con.region], country: r[map.con.country],
      electorate: num(r[map.con.electorate]), validVotes: num(r[map.con.validVotes]),
      invalidVotes: num(r[map.con.invalidVotes]), majority: num(r[map.con.majority]),
      winnerRaw: r[map.con.first], runnerUpRaw: r[map.con.second],
      byParty: candById.get(id) ?? new Map(), comparable: src.comparable,
    }))
    idMap[id] = id   // UK: source ons_id IS the GSS constituencyId (identity map)
  }
  return finalize(electionId, rows, idMap, conIds, new Set(candById.keys()))
}

// --- notional layout (long-only, one CSV) ----------------------------------------
async function cleanNotional(electionId, src) {
  const raw = await readCsvObjects(src.file)
  const N = NOTIONAL

  const byCons = new Map()   // id -> raw candidate rows
  for (const r of raw) {
    const id = r[N.id]
    if (!id) continue
    if (!byCons.has(id)) byCons.set(id, [])
    byCons.get(id).push(r)
  }

  const rows = [], idMap = {}
  for (const [id, group] of byCons) {
    const byParty = new Map()
    for (const r of group) addCandidate(byParty, r[N.party], num(r[N.votes]) ?? 0, num(r[N.share]), num(r[N.change]))
    const win = group.find(r => r[N.pos] === '1')   // winner / runner-up by result position
    const run = group.find(r => r[N.pos] === '2')
    const head = group[0]                            // constituency fields repeat per row
    rows.push(deriveRow({
      id, name: head[N.name], region: head[N.region] || head[N.country], country: head[N.country],
      electorate: num(head[N.electorate]), validVotes: num(head[N.validVotes]),
      invalidVotes: num(head[N.invalidVotes]),
      majority: win ? num(win[N.majority]) : null,   // majority sits only on the winner row
      winnerRaw: win ? win[N.party] : null,
      runnerUpRaw: run ? run[N.party] : null,
      byParty, comparable: src.comparable,
    }))
    idMap[id] = id
  }
  const ids = new Set(byCons.keys())
  return finalize(electionId, rows, idMap, ids, ids)
}

async function main() {
  // Prove on uk-2019 first (§1.3), then the rest; notional last. Explicit args override.
  const requested = process.argv.slice(2)
  const ids = requested.length ? requested : ['uk-2019', 'uk-2015', 'uk-2017', 'uk-2024', 'uk-2019-notional']
  let failed = false
  for (const id of ids) {
    const src = SOURCES[id]
    if (!src) { console.error(`✗ Unknown electionId '${id}'`); failed = true; continue }
    try {
      await (src.layout === 'notional' ? cleanNotional(id, src) : cleanWideLong(id, src))
    } catch (err) {
      failed = true
      console.error(`✗ ${err.message}`)
    }
  }
  if (failed) process.exitCode = 1
}

main()
