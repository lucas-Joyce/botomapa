# server/data/raw — UK raw inputs (Phase 1, §1.1)

Raw acquisitions for the UK pipeline. Cleaning script (§1.3 `clean-uk.js`) reads
from here and writes verified output to `server/data/processed/`. Nothing here is
edited by hand — replace by re-downloading from the documented source.

## Layout
- `GE20{15,17,19}-{constituency,candidate}.csv` — INGE baseline, **2017 boundaries**
  (`ons_id` = `PCON17CD`). Kept as-is. `GE2019-*` is the **actual** 2019 result and
  is deliberately retained alongside the incoming **notional 2019** (see below) so the
  two can be compared — actual-2019 is `boundariesComparable: false` vs 2024.
- `GE2019-constituencyTEST.csv` — 3-row sample; left untouched.
- `geojson/`  — ONS boundary GeoJSON (2024 boundaries).
- `topojson/` — TopoJSON (`uk.json`, the 2017-boundary INGE map, relocated here).
- `hexjson/`  — Open Innovations hex-cartogram layout (2024 constituencies).

## Acquired 2026-07-07 — verified

| File | Records | Source |
|---|---|---|
| `geojson/PCON_JUL_2024_BGC.geojson` | 650 | ONS Open Geography Portal — Westminster Parliamentary Constituencies (July 2024) Boundaries UK **BGC** (generalised/clipped, right weight for web). Downloaded as GeoJSON, `outSR=4326`, from the ArcGIS FeatureServer. |
| `hexjson/uk-constituencies-2024.hexjson` | 650 | Open Innovations — `.../hexmaps/maps/uk-constituencies-2023.hexjson` (source names it by the 2023 boundary-review year; these are the 650 seats contested in 2024). |
| `HoC-GE2024-results-by-constituency.csv` | 650 | HoC Library CBP-10009 — detailed results by constituency (wide). **2024 boundaries** (`PCON24CD`). Note new schema vs older files: Title-Case headers, `RUK` (Reform), `APNI` (Alliance). |

**sha256**
```
4bdc6d2d5e86211666b3f43a8276afc283ead43ed714c9940d53533a9f3e0285  geojson/PCON_JUL_2024_BGC.geojson
7a99cbd2f9574ee7e3fcb55a106189b7342d35c899e96554f51c06b6c73469d0  hexjson/uk-constituencies-2024.hexjson
```
(GE2024 constituency CSV checksum omitted — user-supplied download; re-verify if re-fetched.)

**ID verification (DoD §3):** GeoJSON, HexJSON and the GE2024 constituency CSV all
carry the **same 650 `PCON24CD` GSS codes** — cross-checked **650/650**, zero
unmatched on any side.

### Source links
- HoC Library GE2024 results (CBP-10009): https://commonslibrary.parliament.uk/research-briefings/cbp-10009/
- ONS BGC boundaries (about): https://geoportal.statistics.gov.uk/datasets/ons::westminster-parliamentary-constituencies-july-2024-boundaries-uk-bgc-2/about
- ONS FeatureServer: https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BGC/FeatureServer/0
- Open Innovations hex maps: https://open-innovations.org/projects/hexmaps/constituencies/

## HoC-schema CSVs in place (verified 2026-07-07)

Downloaded from CBP-10009, newer HoC schema (Title-Case headers, `RUK`/`BRX`,
`APNI`). All 650-seat, cross-checked:

| File | Rows | Boundaries | Notes |
|---|---|---|---|
| `HoC-GE2024-results-by-constituency.csv` | 650 | **2024** (`PCON24CD`, 650/650 vs geo+hex) | wide |
| `HoC-GE2024-results-by-candidate.csv` | 4,515 cand / 650 seats | 2024 | long |
| `HoC-GE2019-results-by-constituency.csv` | 650 | **2017** (only 5/650 vs 2024) | **actual** 2019, *not* notional |
| `HoC-GE2019-results-by-candidate.csv` | 3,320 cand / 650 seats | 2017 | **actual** 2019, *not* notional |

The two `HoC-GE2019-*` files hold the **same numbers** as the older
`GE2019-*.csv` (verified identical for Aberavon) — the value is that they share the
2024 files' schema, so `clean-uk.js` can parse 2019 + 2024 on one code path.

## STILL NEEDED — notional 2019 (a *different* dataset, not in CBP-10009)

Notional 2019 = 2019 votes **re-estimated onto the 2024 boundaries** (would match
650/650 `PCON24CD`; seats like "Aberafan Maesteg"). It is the swing baseline for
2024 (§3.1) and is **not** published in the GE2024 results briefing — it's produced
separately by **Rallings & Thrasher**. Sources (download in a browser):

- Elections Centre (Rallings & Thrasher, the producers): https://www.electionscentre.co.uk/
- UK Parliament election results portal (hosts 2019-on-2024-boundaries): https://electionresults.parliament.uk/
- Reference table (for spot-checking): https://en.wikipedia.org/wiki/Notional_results_of_the_2019_United_Kingdom_general_election_by_2024_constituency

Save as `GE2019-notional-constituency.csv` (+ `-candidate.csv` if published).
Once in, it must cross-check **650/650 vs `PCON24CD`** before any join code (§1.1 gate).
