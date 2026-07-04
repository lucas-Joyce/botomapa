# BotoMapa — Phase 0: Scaffold & Contracts

> Goal of Phase 0: get every **contract** (data shape, colour source of truth,
> client↔server plumbing) locked before a single map is drawn — so Phase 1 (UK
> vertical slice) is pure execution, not architecture. Target: ~1 week.
> Follows `vault/notes/botomapa-build-plan-v2.md`. **UK only. Do not build 5
> country pages for 1 country's data.**

Legend: `[x]` done · `[~]` partially done, needs work · `[ ]` to do

---

## 0.1 — Reconcile docs with reality first
- [x] Correct ROADMAP: UK choropleth marked `planned` (was `done` — page is a stub), and retargeted to **raw D3 + d3-geo + 2023-boundary TopoJSON** (was react-simple-maps + ONS GeoJSON).
- [x] Kill the stale **MERN/MongoDB** claim in `AGENTS.md`/`CLAUDE.md` + vault `Hub.md`/`ROADMAP.md` — all now say "thin static-JSON server, SQL later, not MongoDB". _(Global identity file `vault/AGENTS.md` left as-is by design — personal bio, not project stack.)_
- [x] Name decided: **BotoMapa** — updated `index.html` `<title>` and `LandingPage` heading (was "Political Map").

## 0.2 — Monorepo & dev plumbing
- [x] `client/` — Vite + React 19 scaffold exists.
- [x] `server/` — thin Express app (`server/index.js`), no DB. `/api/health` + `/api/:country` (reads `data/processed/:country.json`).
- [x] Vite dev proxy `'/api' → http://localhost:3001` in `vite.config.js` (§3.11 — avoid the CORS evening).
- [x] Root `package.json` runs both together: `npm run dev` (concurrently, client+server). Also `install:all`.
- [x] `server/data/processed/` exists (`.gitkeep`) as the static-JSON serving dir.

## 0.3 — Colour: single source of truth (§2.2)
- [x] `client/src/config/colorMaps.js` — **two palettes** for all 5 countries: standard party colours **+** Okabe–Ito colourblind-safe.
- [x] `client/src/config/themeBridge.js` — `emitPartyColors()` writes `--party-*` custom props; `partyColor()` resolves a fill for D3. `PaletteEmitter` (route-aware) re-emits on country/palette change.
- [x] Party colour is JS-sourced only. `themes/_default.scss` documents that SCSS defers to the JS-emitted `--party-*` vars (no hardcoded hexes) — resolves the two-sources-of-truth risk.
- [x] Extended `ThemeContext`: added `palette` (`standard` | `colourblind`) + `togglePalette`, persisted to localStorage, reflected as `[data-palette]`. NavBar has a colourblind toggle button. _(Hook split into `context/theme-context.js` for Fast Refresh / lint.)_

## 0.3b — Election year picker (right sidebar "Data")
- [x] `client/src/config/elections.js` — elections per country back to ≥2015 (UK 2015–2024; others 2016/2017 → 2024/2025), each with `id`, `year`, `date`, `type`.
- [x] `client/src/config/countries.js` — single source for country slugs/names + `countryFromPath()`; NavBar & LandingPage now consume it (removed duplicated arrays).
- [x] `SideNav` reworked: route-aware, lists the active country's elections under **Data** as selectable options (was dead `/data`,`/analytics`… links). Selection derived during render; wires to the map in Phase 1+.

## 0.4 — The merged data contract (§2.1, adopt now)
- [x] `client/src/config/dataContract.md` — merged row shape keyed by `constituencyId` (GSS code), field-by-field sourced to the real INGE columns (`ons_id`/`PCON17CD`, wide constituency + long candidate CSVs), with a real Aberavon GE2019 example.
- [x] Result fields defined; `socio: null` now (Phase 7 fills without a schema change).
- [x] `boundariesComparable: boolean` on every row — flags the 2024 new-boundary/new-GSS-code break (§3.1).
- [x] Documented rule: cleaning scripts emit an array → `server/data/processed/<electionId>.json`; every view consumes the one array via a `Map` lookup (§3.3); **assert seat count + log unmatched ids** (§3.5).
- [x] `client/src/config/parties.js` — party registry (code → name) + `normalizeParty()` collapsing raw labels (Con/Conservative, ukip→brexit→reform ⇒ `RUK`, minors ⇒ `OTH`). Codes verified aligned with `colorMaps.js`.

## 0.5 — Router shell: trim to UK
- [x] `BrowserRouter` + routes for all 6 pages wired in `App.jsx`.
- [ ] Keep `/` + `/uk` as the **active** targets for now; leave the other 4 stubs but don't invest in them.
- [ ] Fix `SideNav` — its links (`/data`, `/analytics`, `/map`, `/overview`) are **dead routes**. Repurpose to real per-country view switches (choropleth / hex / waffle) or hide until Phase 2.
- [ ] Replace placeholder `Credit` data (Jane Smith / Acme UI Kit) with real attributions, or defer with a `TODO`.

## 0.6 — Guardrails baked in before any D3 (cheap now, painful later)
- [ ] `useElectionData(country)` hook stub that returns a **`Map`-based lookup** (`new Map(rows.map(d => [d.constituencyId, d]))`) — no component ever calls `.find()` in a loop (§3.3).
- [ ] Document the **StrictMode D3 rules** in a short `client/src/viz/README.md`: React owns `<svg>`, D3 owns children, render via `.join()` only, effects return cleanup (§3.4).
- [ ] Install viz deps when Phase 1 starts, **not** react-simple-maps: `d3-geo`, `d3-scale`, `d3-scale-chromatic`, `topojson-client` (§2.3). (Nivo added later, waffle only.)

---

## Definition of Done for Phase 0
1. `npm run dev` boots **client + server together**; `/api/health` responds through the Vite proxy.
2. `colorMaps.js` + `themeBridge.js` exist; toggling palette flips `--party-*` custom properties live (verify in DevTools).
3. The merged data contract is written down and agreed — socio fields null, `boundariesComparable` present.
4. Router serves `/` and `/uk`; no dead nav links.
5. Docs no longer contradict each other (no "UK done", no "MongoDB").

**Exit → Phase 1:** UK data pipeline (HoC Library 2024 CSV + notional 2019 → cleaning script → static JSON, assert 650/650 ID match).
