# Merged Data Contract

The one row shape every map component consumes (build-plan-v2 §2.1). Cleaning
scripts (Phase 1+) output an **array of these rows** to
`server/data/processed/<electionId>.json` (e.g. `uk-2019.json`); the server serves
it at `/api/:country/:electionId` and `useElectionData` builds a `Map` keyed by
`constituencyId` (never `.find()` in a render loop — §3.3).

Grounded in the real data in the read-only `second-milestone-INGE` prototype
(`data/mapData/uk.json`, `data/csvData/csvUK/GE20XX-*.csv`).

---

## The join key: `constituencyId`

GSS code (e.g. `E14000530`, `W07000049`). It is the **only** key that ties
geometry to results — everything joins on it.

| Source | Field | Note |
| --- | --- | --- |
| Map (TopoJSON) | `PCON17CD` (properties) | Dec **2017** boundaries in the prototype; also `PCON17NM`, `LONG`/`LAT` centroids (reused for hex generation later) |
| Results CSV | `ons_id` | matches `PCON**CD` for the same boundary vintage |

⚠️ **Boundary vintage matters (§3.1).** The prototype covers 2015/2017/2019, all on
2017 boundaries. UK **2024** was fought on redrawn constituencies with **new GSS
codes** (`PCON24CD`) — it needs its own TopoJSON and will **not** join to the older
files. Hence `boundariesComparable` on every row (below).

---

## Row shape

```
ElectionResultRow {
  constituencyId:   string    // GSS code — the join key
  constituencyName: string    // constituency_name / PCON**NM
  region:           string    // region_name  (e.g. "Wales", "South East")
  country:          string    // country_name ("England"|"Scotland"|"Wales"|"Northern Ireland")

  electorate:       number    // electorate
  validVotes:       number    // valid_votes
  invalidVotes:     number | null   // invalid_votes
  turnout:          number | null   // derived: validVotes / electorate  (0–1)

  winner:           string    // canonical party CODE (normalizeParty of first_party)
  runnerUp:         string | null    // normalizeParty of second_party
  majority:         number    // majority (votes)
  majorityShare:    number | null    // derived: majority / validVotes (0–1)

  results: Array<{           // one entry per contesting party, sorted votes desc
    party:  string           // canonical party CODE (parties.js)
    votes:  number
    share:  number | null    // 0–1
    change: number | null    // vs previous election, may be absent
  }>

  boundariesComparable: boolean   // false across the 2024 boundary change (§3.1)
  socio: null                     // Phase 7 — deprivation/income overlay; null for now
}
```

### Notes
- **`party` is a CODE, never a colour or a raw label.** Raw CSV labels
  (`Con`/`Conservative`, `LD`/`Liberal Democrat`, …) are collapsed via
  `normalizeParty(country, raw)` in `parties.js`. The wide CSV's populist-right
  column renames by year (`ukip` 2015/2017 → `brexit` 2019 → `reform` 2024), and
  each maps to its **own** code — `UKIP` / `BREXIT` / `RUK`. Rebrands are **not**
  merged (`parties.js` RULE), so cross-year swing stays meaningful.
- **Colour is not stored.** Render resolves it at paint time:
  `partyColor(country, row.winner, palette)` (`themeBridge.js`), so the same row
  renders in standard **or** colourblind palette. **Night/day theme touches only
  chrome** (region stroke, background, text) via `--color-*` tokens — never party
  fills. This keeps one data file valid across all four colour/theme combinations.
- `socio` stays `null` now so the shape is frozen; Phase 7 fills
  `{ imd, income, ... }` without a schema change.

---

## Example (real — Aberavon, GE2019)

```json
{
  "constituencyId": "W07000049",
  "constituencyName": "Aberavon",
  "region": "Wales",
  "country": "Wales",
  "electorate": 50750,
  "validVotes": 31598,
  "invalidVotes": 82,
  "turnout": 0.6226,
  "winner": "LAB",
  "runnerUp": "CON",
  "majority": 10490,
  "majorityShare": 0.332,
  "results": [
    { "party": "LAB", "votes": 17008, "share": 0.5383, "change": -0.1429 },
    { "party": "CON", "votes": 6518,  "share": 0.2063, "change":  0.0289 },
    { "party": "BREXIT", "votes": 3108, "share": 0.0984, "change": null },
    { "party": "PC",  "votes": 2711,  "share": 0.0858, "change": null },
    { "party": "LD",  "votes": 1072,  "share": 0.0339, "change": null },
    { "party": "OTH", "votes": 731,   "share": 0.0231, "change": null },
    { "party": "GRN", "votes": 450,   "share": 0.0142, "change": null }
  ],
  "boundariesComparable": true,
  "socio": null
}
```

---

## Cleaning-script contract (per election, Phase 1+)

Every country/year cleaning script MUST:
1. Read the wide constituency CSV + long candidate CSV, join on `ons_id`.
2. `normalizeParty()` every party label; sum any collisions (e.g. Lab + Lab Co-op).
3. Emit the array above to `server/data/processed/<electionId>.json`.
4. Emit an `idMap` (source id ↔ `constituencyId`) alongside it (§3.5).
5. **Assert** `rows.length === expectedSeatCount` (UK 650) and **log unmatched
   ids** on both sides of the join. Fail loudly rather than render a partial map.

Consumers never re-derive these fields — the contract is the boundary between the
data pipeline and the view layer.
