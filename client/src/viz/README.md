# viz/ — D3 rendering rules

D3 map/cartogram renderers live here, kept separate from React render logic
(per `CLAUDE.md`). These rules exist **before** any D3 is written because they
are cheap to follow now and painful to retrofit later (§3.4).

## StrictMode contract — React owns the shell, D3 owns the children

React 19 runs effects **twice** in development StrictMode (mount → unmount →
mount). Any D3 code that appends without cleaning up will double-render. So:

1. **React owns the `<svg>`.** It is a JSX element in the component tree. D3
   never creates or removes it — D3 only ever selects into it.
2. **D3 owns the children** of that `<svg>` (paths, hexes, circles). React does
   not touch them.
3. **Render via `.join()` only.** Bind data and let the enter/update/exit
   selections reconcile. Never `.append()` in a loop — that is what breaks under
   StrictMode's double-invoke.
4. **Effects return cleanup.** The `useEffect` that draws must return a function
   that tears its drawing down (e.g. clears the group it rendered into), so the
   second StrictMode pass starts from a clean slate.
5. **One array in, `Map` lookup out.** Renderers read data through
   `useElectionData` (a `Map` keyed by `constituencyId`) — never `.find()` in a
   draw loop (§3.3).

## Dependencies

The viz deps are already present via the `d3` meta-package (v7 — bundles
`d3-geo`, `d3-scale`, `d3-scale-chromatic`) plus `topojson-client`. We do **not**
use `react-simple-maps` — it owns its own SVG tree and blocks the hex↔choropleth
morph. Nivo is added later, for the waffle only.
