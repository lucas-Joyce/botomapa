# BotoMapa — Phase 2: UK Vertical Slice

> Goal of Phase 2: render the **UK dataset three ways** — choropleth (raw D3),
> hex cartogram (650 hexes), and a waffle — all reading the **one** `useElectionData`
> fetch, with a **toggleable palette** (standard ↔ colourblind) and **keyboard-
> accessible** tooltips. No new data work: Phase 1 already serves 650/650. Target:
> ~2–3 weeks. Follows `vault/notes/botomapa-build-plan-v2.md` §4 Phase 2 + §2.3/§3.4/§3.10.

Legend: `[x]` done · `[~]` partially done, needs work · `[ ]` to do

> **Reality check up front.** Phase 0 built the render *scaffolding* — `MapContainer`
> owns an `<svg>` + `<g>` with d3-zoom; `colorMaps.js` (standard **and** colourblind
> palettes), `themeBridge.js`, and `PaletteEmitter` are wired; the SideNav already
> toggles `mapMode` (`choropleth`/`hex`/`dorling`/`waffle`). Phase 1 delivers `byId`
> (650 rows, GSS-keyed). **What's missing:** the actual renderers, the served
> **geometry**, and the shared `Legend`/`Tooltip`/`SeatCounter`. Two things the
> build-plan glosses: (a) the 2024 boundaries arrived as a **21 MB GeoJSON** — it
> must be simplified → TopoJSON before it can load; (b) there is **no choropleth to
> "port"** in this repo — the old one lives in the read-only `second-milestone-INGE`
> prototype (reference only, on 2017 boundaries). So Phase 2 builds the map fresh.

---

## 2.0 — Geometry: prepare + serve, **split per boundary vintage** (the prerequisite, §3.1)
Geometry is keyed by **boundary set, not by election** — one file per vintage, each
matching the idMaps of the elections fought on it (verified 650/650 both sides):

| Vintage | File | Property key | Elections | Status |
| --- | --- | --- | --- | --- |
| **2017** | `raw/topojson/uk.json` (INGE BSC, object `Westminster_..._December_2017__UK_BSC`) | `PCON17CD` | uk-2015/2017/2019 | **already a quantized TopoJSON — reuse as-is** |
| **2024** | from `raw/geojson/PCON_JUL_2024_BGC.geojson` (21 MB) | `PCON24CD` | uk-2024, uk-2019-notional | needs simplify → TopoJSON |

- [x] Confirm the join per vintage: 2017 geometry ↔ uk-2015/2017/2019 = 650/650; 2024 geometry ↔ uk-2024/notional = 650/650.
- [x] **Reuse the 2017 geometry** (`uk.json`) unchanged → `client/public/geometry/uk-2017.topojson` (998 KB, object `Westminster_..._December_2017__UK_BSC`, `PCON17CD`).
- [x] **Convert 2024** via `mapshaper` (`-simplify 8% keep-shapes -clean -filter-fields PCON24CD,PCON24NM -rename-layers uk2024 -o quantization=1e5`): 21 MB → **491 KB**, object `uk2024`, 650 features, `PCON24CD`/`PCON24NM` only.
- [x] **Decision — conversion tool:** `mapshaper` CLI added as a build-time devDep + reproducible **`npm run geo:uk`** script (regenerates all three files). Matches the INGE mapshaper workflow. `topojson-client` already present for `feature()` at load.
- [x] **Decision — geometry location:** `client/public/geometry/` (Vite serves directly, no Express code, off the JS bundle). Data still loads via `/api`. _(Build-plan §4.4 defers a server TopoJSON pipeline to Phase 4.)_
- [x] **Re-assert the join after simplification (§3.5):** ids survived — 2024 geometry key set === `uk-2024` `byId` keys, **650/650**.
- [x] **Election → geometry map** (by vintage) — the one piece left: a small manifest (file + object name + id property per vintage) so a renderer resolves `electionId → geometry`. Bridges into §2.1. The **HexJSON** is 2024-only (a 2017-boundary hex is **not acquired** → hex view is 2024-only in Phase 2 unless sourced).

## 2.1 — Choropleth in raw D3 (§2.3 — no react-simple-maps)
- [x] `client/src/viz/ChoroplethMap.jsx` renders into a React-owned `<g>` inside `MapContainer`'s `<svg>` — **React owns the SVG, D3 owns the paths** (`viz/README.md`). Wired via a `mapMode` switch in `UKPage`; **`MapContainer` was previously passed no children, so nothing drew — that was the "map not displaying" bug.**
- [x] Loads the TopoJSON per boundary vintage (small inline `UK_GEOMETRY` manifest: file + object + id prop), `topojson.feature()` → GeoJSON, projected with **d3-geo** `geoMercator().fitSize()` to the measured SVG size (BGC is EPSG:4326 lon/lat).
- [x] **`.join('path')` only** (StrictMode-idempotent); `fill = partyColor('uk', byId.get(d.properties[idProp])?.winner, palette)` — the `Map` lookup, **never `.find()`** in the draw loop (§3.3).
- [x] Effect returns cleanup (clears its group); redraws on `byId` / geometry / `palette` / **size** (ResizeObserver). **Verified in-browser: 650 paths, correct 2024 fills, north-up UK shape** (headless screenshot).

## 2.2 — HexCartogram (650 hexes)
- [x] `client/src/viz/HexCartogram.jsx` renders into the **same** `<svg>` context as the choropleth (Phase 4 hex↔geo morph stays possible; waffle never morphs — §2.1).
- [x] Parses the HexJSON (`layout: odd-r`, keys are GSS codes = `byId` keys); draws one hex per constituency via **`.join('polygon')`**; same `byId` + `partyColor(..., palette)` fill. odd-r → pixel centres with **y negated** so higher `r` (Orkney) sits north (top).
- [x] Hexes carry the same identity/interaction contract as paths — `tabindex`/`role="img"`/`aria-label` — so the shared `Legend`/`Tooltip`/`SeatCounter` (2.3) stay view-agnostic.
- [~] **Verified by layout maths** (all 650 hexes north-up + within viewport bounds, `.join()` compiles) — **not yet eyeballed in-browser**: the HEX toggle needs a manual click the headless check couldn't drive. Open the HEX view once and confirm.

## 2.3 — Shared Legend / Tooltip / SeatCounter (one set, both maps)
- [ ] `Legend` — the parties **present in the current election** (from `byId`), swatch colour via `--party-*` / `partyColor`. Updates on election + palette change.
- [x] ~~`Tooltip`~~ **detail rendered in the country-page sidebar** (`InfoPanel`), not a floating tooltip — the map reports the hovered/focused constituency up via an `onHover` callback; the panel shows name, region, winner, majority, turnout + per-party results (swatch via `--party-*`). **Focus-accessible (§3.10):** shapes have `tabindex`/`role="img"`/`aria-label`; the panel updates on **hover *and* focus** (both verified over CDP). Clear is on the group's `mouseleave`/`focusout`, so moving between shapes never flickers.
- [~] `SeatCounter` — the seats-per-party tally already renders in `InfoPanel` (§1.6) ✓, but **without the 326 majority line** yet. Not yet extracted into a shared component.
- [~] The detail reads the one fetch (Map lookup, no `.find()`) ✓; `Legend` + the 326 line still owed.

## 2.4 — Waffle (sibling panel, Nivo)
- [ ] Seat-total waffle as a **separate** panel (it owns its own SVG — never part of the hex↔geo morph, §2.1).
- [ ] **Dependency decision (ASK):** `@nivo/waffle` (runtime dep). Justify vs a hand-rolled SVG grid (650 cells is trivial in raw D3, and avoids a heavy dep + its own React tree). _(Name + justify + wait for yes.)_

## 2.5 — Palette toggle wired through `themeBridge`
- [x] D3 fills are set from JS via `partyColor(country, winner, palette)`; both renderers take `palette` (from `useTheme`) as a dep, so a toggle **redraws** (not just CSS). `PaletteEmitter` still mirrors `--party-*` for chrome/SCSS.
- [~] `togglePalette` exists in `ThemeProvider`; the renderers already re-resolve fills on palette change. **Not yet visually confirmed** across all four theme×palette combos on-screen.
- [ ] Keep **night/day theme touching only chrome** (region stroke, bg, text via `--color-*`), **never** party fills (dataContract rule). Verify all four theme×palette combos on one dataset.

## 2.6 — Accessibility & keyboard (§3.10, DoD §5)
- [x] Every hex/region is **focusable** (`tabindex="0"`), `role="img"` + `aria-label` per shape, and **detail-on-focus** drives the sidebar (verified over CDP — focusing a path shows its constituency). Shapes also show a pointer cursor + hover/focus stroke highlight.
- [ ] Verify the palette with a **deuteranopia simulator** (Firefox DevTools accessibility panel) — DoD §4.

---

## Definition of Done for Phase 2 (build-plan §6)
1. UK 2024 geometry (TopoJSON + HexJSON) served/bundled and **ID-matched 650/650** to `byId` (asserted, post-simplification).
2. **All three views** (choropleth, hex, waffle) render from the **one** `useElectionData` fetch — **no console warnings under StrictMode**.
3. Palette toggle (standard ↔ colourblind) verified with a **deuteranopia simulator**; night/day theme never touches party fills.
4. **Keyboard:** every hex/region focusable, tooltip shown on focus, `aria-label` present.
5. Switching election in the SideNav updates all three views + Legend + SeatCounter with no stale flash.

**Exit criterion (build-plan §4 Phase 2):** *one country, three views, one dataset, toggleable palette.* This is a **shippable portfolio piece** — commit and deploy before expanding.

**Exit → Phase 3 (Swing & Arc):** Butler swing on **notional-2019 vs 2024** (`uk-2019-notional.json` is already processed and served, §1.1) on a diverging colourblind-safe scale + a ParliamentArc. The swing baseline is in place; Phase 2 owes it nothing.
