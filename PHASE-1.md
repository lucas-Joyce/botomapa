# BotoMapa — Phase 1: UK Data Pipeline

> Goal of Phase 1: prove the **whole pipeline** end to end for the UK — raw CSV →
> Node cleaning script → static JSON → Express route → `useElectionData` hook —
> with a hard **650-seat assertion** at the join. This is the "real backend-first"
> (build-plan-v2 §4). **No map is drawn in Phase 1** — that's Phase 2. Target: ~1
> week. Follows `vault/notes/botomapa-build-plan-v2.md` §4 Phase 1 + §3.1/§3.3/§3.5.

Legend: `[x]` done · `[~]` partially done, needs work · `[ ]` to do

> **Reality check up front.** The read-only `second-milestone-INGE` prototype has
> UK **2015 / 2017 / 2019** CSVs on **2017 boundaries** (`PCON17CD` / `ons_id`) and
> a matching TopoJSON — enough to build and *prove* the pipeline today. UK **2024**
> (new boundaries), **notional 2019**, and the **2023-boundary** TopoJSON/HexJSON
> are **not in the repo** and must be acquired (1.1). So Phase 1 = *build the script
> on data that exists* **+** *acquire the 2024-vintage inputs Phase 2/3 need*.

---

## 1.1 — Acquire the real UK inputs (data-first — highest risk, §3.1/§3.5)
- [x] Confirm the on-disk baseline: INGE `data/csvData/csvUK/GE20{15,17,19}-{constituency,candidate}.csv` + `data/mapData/uk.json` (2017 boundaries). These are the *proving* inputs — read-only, copy into `server/data/raw/` (never write back to INGE).
- [x] Acquire **GE2024** results — House of Commons Library, briefing **CBP-10009**: constituency (650) + candidate (4,515 cand / 650 seats) CSVs in place, both **ID-matched 650/650** vs boundaries+hex. 2024 boundaries, `PCON24CD`.
- [ ] Acquire **notional 2019** (2019 votes re-estimated onto 2024 boundaries) — **correction:** *not* in CBP-10009; it's a separate Rallings & Thrasher dataset (Elections Centre / electionresults.parliament.uk). The `HoC-GE2019-*` files downloaded are **actual** 2019 (2017 boundaries, 5/650 vs 2024), not notional. This is the *only* valid swing baseline for 2024 (§3.1); actual-2019 retained alongside for comparison.
- [x] Acquire the **2024 constituency boundaries** — ONS Open Geography Portal, *"Westminster Parliamentary Constituencies (July 2024) Boundaries UK"* (**BGC** = generalised/clipped is right for web maps; download GeoJSON → convert to TopoJSON) + the **HexJSON** (Open Innovations, updated 650). Phase 2 renders them; Phase 1 only **verifies IDs match** the 2024 results before any join code is written. _(Both acquired: `raw/geojson/PCON_JUL_2024_BGC.geojson` + `raw/hexjson/uk-constituencies-2024.hexjson`; **650/650 `PCON24CD` match** across boundaries, hex, and the 2024 results CSV. GeoJSON→TopoJSON conversion deferred to Phase 2.)_
- [~] Store raw acquisitions under `server/data/raw/` (git-tracked or documented source + checksum); processed output stays `server/data/processed/`. _(New `raw/{geojson,topojson,hexjson}/` subfolders; sources + sha256 documented in `raw/README.md`. `uk.json` relocated to `raw/topojson/`.)_

### Sources (official — these replace the aged INGE 2015–2019 data)
- **HoC Library — General election 2024 results (CBP-10009):** https://commonslibrary.parliament.uk/research-briefings/cbp-10009/ — constituency + candidate result CSVs **and** notional 2019.
- **UK Parliament election results portal:** https://electionresults.parliament.uk/ · Library elections-data index: https://commonslibrary.parliament.uk/tag/elections-data/
- **ONS Open Geography Portal (2024 boundaries):** https://geoportal.statistics.gov.uk/ — search *"Westminster Parliamentary Constituencies (July 2024)"*.
- **Open Innovations constituency HexJSON:** https://open-innovations.org/ (hexmaps → 2024 constituencies).

## 1.2 — Reconcile the API contract: election-keyed files vs `/api/:country`
- [x] **Contradiction to fix:** `server/index.js` serves `/api/:country` → `processed/<country>.json`, but `dataContract.md` + `elections.js` key data by **`electionId`** (`uk-2024.json`, `uk-2019.json`). The SideNav already selects an `electionId` (`ViewContext.selectedYear`).
- [x] **Resolution implemented:** `GET /api/:country/:electionId` → `processed/<electionId>.json`, with a `^<country>-\d{4}$` guard (validates id + blocks path traversal). Bare `/api/:country` **dropped** (no implicit "newest" that drifts). `dataContract.md` updated to match.
- [ ] Update `useElectionData` to fetch by the selected `electionId`, not just country (1.5).

## 1.3 — The cleaning script (`server/scripts/clean-uk.js`) — the core deliverable
- [x] New `server/scripts/` dir + `clean-uk.js`. Honours the **cleaning-script contract** in `dataContract.md` §"Cleaning-script contract":
  - [x] Read the **wide** constituency CSV (totals, `first_party`/`second_party`, `electorate`, `valid_votes`, `majority`) + the **long** candidate CSV (one row per candidate → `results[]`), join on `ons_id`. Two header dialects (`ons` old snake_case for 2015/2017; `hoc` HoC Title-Case for 2019/2024), one core.
  - [x] `normalizeParty('uk', raw)` every label; **sum collisions** (e.g. Lab + Lab Co-op; every minor/independent → summed `OTH`). Rebrands stay distinct — `UKIP`/`BREXIT`/`RUK` (added `brx`/`ruk` aliases to `parties.js`; verified RUK in 2024, BREXIT in 2019, UKIP in 2015/17).
  - [x] Derive `turnout`, `majorityShare`, per-party `share` (source is 0–1); sort `results` votes-desc; set `boundariesComparable` (2024 = true; actual 2015/2017/2019 = 2017-boundary set = false). Notional-2019 deferred to Phase 3 (store-only).
  - [x] Emit the array to `processed/<electionId>.json` **and** an `idMap` (`<electionId>.idMap.json`, identity for UK since `ons_id` IS the GSS `constituencyId`).
  - [x] **Assert `rows.length === 650`** (before any write); **log unmatched ids on both sides**; **fail loudly** (`process.exitCode = 1`) rather than write a partial file.
- [x] Idempotent + prints a summary line (seats, parties seen, OTH count, unmatched) — DoD §1. Verified: uk-2019 Aberavon row is a byte-for-byte match to the `dataContract.md` example.
- [x] Prove it on **2019 first**, then 2015/2017/2024. All four emit **650/650, 0 unmatched**; served live via `GET /api/uk/<electionId>`.
- [x] Add an npm script (`server` → `clean:uk`) so it's runnable, not a loose file.

## 1.4 — CSV parsing: dependency decision (**ASK** — global rule)
- [x] The script needs a CSV parser. The source CSVs contain quoted fields (constituency/party names with commas), so a naïve `split(',')` is wrong. Confirmed in-data: old INGE files too (`"Ayr, Carrick and Cumnock"`).
- [x] **Decision: hand-roll**, no dependency (per "a few own lines beat a package"). One `parseCsv()` handles the union of what the files actually contain — quotes-protect-commas (all files), `""`→`"` unescape (notional, 11,473×), CRLF/LF; **no** multi-line-field case exists in any file. Lives in `server/scripts/` and is exercised by a round-trip check on the old 650-row files. Implemented as part of 1.3.

## 1.5 — Wire `useElectionData` to real data (§3.3)
- [~] Hook exists as a Phase-0 stub (`client/src/hooks/useElectionData.js`) returning an empty `Map`. Phase 1 replaces the stub body with a real fetch.
- [ ] Fetch the selected `electionId` (1.2), `setRows(json)`; keep the **`Map` keyed by `constituencyId`** as the one lookup (never `.find()` in a loop).
- [ ] Follow the StrictMode rules already documented in `client/src/viz/README.md` (cleanup on unmount, no double-fetch flash); add loading/error state.
- [ ] **Assert on the client too:** log if `byId.size !== 650` for a UK election — cheap early warning that a file is stale/partial.

## 1.6 — Prove the thread (no map yet)
- [~] Server `/api/:country` route exists (Phase 0); extend per 1.2 and confirm it serves the real file through the Vite proxy.
- [ ] Minimal proof the data flows: surface `byId.size` (seat count) + selected `electionId` in the existing `InfoPanel` (or a console assert) on `/uk`. No choropleth/hex — that's Phase 2.

---

## Definition of Done for Phase 1 (build-plan §6)
1. `clean-uk.js` runs **idempotently**, logs a summary, and **asserts 650 seats** — failing loudly on any unmatched id.
2. `idMap` committed alongside each `processed/<electionId>.json`.
3. 2023-boundary TopoJSON **and** HexJSON acquired and **ID-matched 650/650** against the 2024 results (verified, not rendered).
4. `/api/uk/<electionId>` serves the processed JSON through the Vite proxy; `useElectionData` builds the `Map` from it with no StrictMode warnings.
5. `boundariesComparable` correct across the 2024 break; notional-2019 stored as the swing baseline (consumed in Phase 3).

**Exit → Phase 2 (UK Vertical Slice):** choropleth in raw D3 + HexCartogram (650) + shared `Legend`/`Tooltip`/`SeatCounter`, all reading the one fetch; palette toggle wired through `themeBridge`. One country, three views, one dataset.
