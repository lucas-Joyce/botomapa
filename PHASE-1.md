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
- [ ] Confirm the on-disk baseline: INGE `data/csvData/csvUK/GE20{15,17,19}-{constituency,candidate}.csv` + `data/mapData/uk.json` (2017 boundaries). These are the *proving* inputs — read-only, copy into `server/data/raw/` (never write back to INGE).
- [ ] Acquire **GE2024** results — House of Commons Library, briefing **CBP-10009**: download *"Detailed results by constituency (csv)"* (~113 KB) + *"Detailed results by candidate (csv)"* (~660 KB). 2024 boundaries, `PCON24CD`.
- [ ] Acquire **notional 2019** (2019 votes re-estimated onto 2024 boundaries) — published in the **same CBP-10009** briefing. This is the *only* valid swing baseline for 2024 (§3.1); actual-2019 is on old boundaries.
- [ ] Acquire the **2024 constituency boundaries** — ONS Open Geography Portal, *"Westminster Parliamentary Constituencies (July 2024) Boundaries UK"* (**BGC** = generalised/clipped is right for web maps; download GeoJSON → convert to TopoJSON) + the **HexJSON** (Open Innovations, updated 650). Phase 2 renders them; Phase 1 only **verifies IDs match** the 2024 results before any join code is written.
- [ ] Store raw acquisitions under `server/data/raw/` (git-tracked or documented source + checksum); processed output stays `server/data/processed/`.

### Sources (official — these replace the aged INGE 2015–2019 data)
- **HoC Library — General election 2024 results (CBP-10009):** https://commonslibrary.parliament.uk/research-briefings/cbp-10009/ — constituency + candidate result CSVs **and** notional 2019.
- **UK Parliament election results portal:** https://electionresults.parliament.uk/ · Library elections-data index: https://commonslibrary.parliament.uk/tag/elections-data/
- **ONS Open Geography Portal (2024 boundaries):** https://geoportal.statistics.gov.uk/ — search *"Westminster Parliamentary Constituencies (July 2024)"*.
- **Open Innovations constituency HexJSON:** https://open-innovations.org/ (hexmaps → 2024 constituencies).

## 1.2 — Reconcile the API contract: election-keyed files vs `/api/:country`
- [ ] **Contradiction to fix:** `server/index.js` serves `/api/:country` → `processed/<country>.json`, but `dataContract.md` + `elections.js` key data by **`electionId`** (`uk-2024.json`, `uk-2019.json`). The SideNav already selects an `electionId` (`ViewContext.selectedYear`).
- [ ] **Recommended resolution:** add `GET /api/:country/:electionId` → `processed/<electionId>.json` (validate `electionId` starts with `country`; keep 404 message). Optionally keep bare `/api/:country` as "newest election" convenience. _(Decision — confirm before implementing.)_
- [ ] Update `useElectionData` to fetch by the selected `electionId`, not just country (1.5).

## 1.3 — The cleaning script (`server/scripts/clean-uk.js`) — the core deliverable
- [ ] New `server/scripts/` dir + `clean-uk.js`. Honours the **cleaning-script contract** in `dataContract.md` §"Cleaning-script contract":
  - [ ] Read the **wide** constituency CSV (totals, `first_party`/`second_party`, `electorate`, `valid_votes`, `majority`) + the **long** candidate CSV (one row per candidate → `results[]`), join on `ons_id`.
  - [ ] `normalizeParty('uk', raw)` every label; **sum collisions** (e.g. Lab + Lab Co-op). Note the wide populist-right column renames by year (`ukip`→`brexit`→`reform`) → distinct codes `UKIP`/`BREXIT`/`RUK` (`parties.js` RULE — rebrands not merged).
  - [ ] Derive `turnout`, `majorityShare`, per-party `share`; sort `results` votes-desc; set `boundariesComparable` (2024 & notional-2019 = comparable pair; actual 2015/2017/2019 = the 2017-boundary set, **not** comparable to 2024).
  - [ ] Emit the array to `processed/<electionId>.json` **and** an `idMap` (source id ↔ `constituencyId`) alongside (§3.5).
  - [ ] **Assert `rows.length === 650`**; **log unmatched ids on both sides** of the join; **fail loudly** (non-zero exit) rather than write a partial file.
- [ ] Idempotent + prints a summary line (seats, parties seen, unmatched count) — DoD §1 of build-plan §6.
- [ ] Prove it on **2019 first** (data on disk), then 2015/2017 come nearly free (same format); 2024 once 1.1 lands.
- [ ] Add an npm script (e.g. `server` → `clean:uk`) so it's runnable, not a loose file.

## 1.4 — CSV parsing: dependency decision (**ASK** — global rule)
- [ ] The script needs a CSV parser. The source CSVs contain quoted fields (constituency/party names with commas), so a naïve `split(',')` is wrong.
- [ ] **Decision:** hand-roll a ~40-line quote-aware parser (no dep, per "a few own lines beat a package") **vs** add a scoped, well-known parser (`csv-parse`). Note: this is a **build-time script dep**, not runtime server code — it never ships in the served bundle. _(Name + justify + wait for yes before adding.)_

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
