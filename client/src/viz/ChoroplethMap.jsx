import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { partyColor } from '../config/themeBridge'

// electionId → which served geometry to draw. Geometry is keyed by boundary
// VINTAGE, not by election (PHASE-2 §2.0): the 2024-boundary elections share the
// 2024 TopoJSON, the older ones share the 2017 file. `object` is the TopoJSON
// object name; `idProp` is the GSS-code property that joins to `byId`
// (which is keyed by `constituencyId`, the same GSS code).
const UK_GEOMETRY = {
  'uk-2024':          { file: 'uk-2024.topojson', object: 'uk2024', idProp: 'PCON24CD' },
  'uk-2019-notional': { file: 'uk-2024.topojson', object: 'uk2024', idProp: 'PCON24CD' },
  'uk-2019': { file: 'uk-2017.topojson', object: 'Westminster_Parliamentary_Constituencies__December_2017__UK_BSC', idProp: 'PCON17CD' },
  'uk-2017': { file: 'uk-2017.topojson', object: 'Westminster_Parliamentary_Constituencies__December_2017__UK_BSC', idProp: 'PCON17CD' },
  'uk-2015': { file: 'uk-2017.topojson', object: 'Westminster_Parliamentary_Constituencies__December_2017__UK_BSC', idProp: 'PCON17CD' },
}

// Choropleth: real UK constituency polygons, filled by winning party.
// React owns the <svg>; this component owns only its <g> children (viz/README).
export default function ChoroplethMap({ byId, status, country = 'uk', electionId, palette, onHover }) {
  const gRef = useRef(null)
  // Parsed geometry, cached in state so a palette toggle re-fills without re-fetching.
  const [geo, setGeo] = useState(null)
  // SVG pixel size, tracked so the projection fits the viewport and refits on resize.
  const [size, setSize] = useState(null)

  const spec = UK_GEOMETRY[electionId]

  // Load + parse the geometry for the active election's boundary vintage.
  useEffect(() => {
    if (!spec) return
    let ignore = false
    fetch(`/geometry/${spec.file}`)
      .then(r => r.json())
      .then(topo => {
        if (ignore) return
        const features = topojson.feature(topo, topo.objects[spec.object]).features
        setGeo({ file: spec.file, idProp: spec.idProp, features })
      })
      .catch(err => console.error('Choropleth geometry load failed:', err))
    return () => { ignore = true }
  }, [spec?.file, spec?.object, spec?.idProp])

  // Refit when the SVG resizes.
  useEffect(() => {
    const svg = gRef.current?.ownerSVGElement
    if (!svg) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(svg)
    return () => ro.disconnect()
  }, [])

  // Clear the sidebar detail when the pointer/focus leaves the whole map. Attached
  // to the group (not each path) so moving BETWEEN paths never flickers to null:
  // `mouseleave`/`focusout` on the parent fire only on exit, not on inner moves.
  useEffect(() => {
    if (!onHover) return
    const sel = d3.select(gRef.current)
    const clear = () => onHover(null)
    sel.on('mouseleave', clear).on('focusout', clear)
    return () => sel.on('mouseleave', null).on('focusout', null)
  }, [onHover])

  // Draw / redraw on data, geometry, palette, or size change. `.join('path')` only,
  // so StrictMode's double-invoke reconciles instead of duplicating (viz/README).
  useEffect(() => {
    const g = gRef.current
    if (!g || status !== 'ready' || !geo || !size || geo.file !== spec?.file) return
    const w = size.w || 800, h = size.h || 600
    const idProp = geo.idProp

    // BGC files are EPSG:4326 lon/lat; fitSize centres + scales to the container.
    const fc = { type: 'FeatureCollection', features: geo.features }
    const path = d3.geoPath(d3.geoMercator().fitSize([w, h], fc))

    d3.select(g)
      .selectAll('path')
      .data(geo.features, d => d.properties[idProp])
      .join('path')
      .attr('d', path)
      .attr('stroke', 'var(--color-region-stroke, #ffffff)')
      .attr('stroke-width', 0.3)
      .attr('tabindex', 0)                          // focus-accessible (§3.10)
      .attr('role', 'img')
      .attr('aria-label', d => {
        const row = byId.get(d.properties[idProp])
        return row ? `${row.constituencyName}: ${row.winner} won by ${row.majority}` : d.properties[idProp]
      })
      // Never .find() in the draw loop — the Map lookup (§3.3); fill from the palette.
      .attr('fill', d => partyColor(country, byId.get(d.properties[idProp])?.winner, palette))
      // Report the hovered/focused constituency up to the sidebar (§3.10).
      .on('mouseenter', (_e, d) => onHover?.(byId.get(d.properties[idProp]) ?? null))
      .on('focus', (_e, d) => onHover?.(byId.get(d.properties[idProp]) ?? null))

    return () => { d3.select(g).selectAll('*').remove() }
  }, [status, byId, geo, size, palette, country, spec, onHover])

  return <g ref={gRef} className="viz-choropleth" />
}
