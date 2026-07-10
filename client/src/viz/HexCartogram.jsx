import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { partyColor } from '../config/themeBridge'

// Pointy-top hexagon outline (SVG points string) centred at (cx,cy).
function hexPoints(cx, cy, radius) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`)
  }
  return pts.join(' ')
}

// HexCartogram: one hex per constituency (odd-r layout), filled by winning party.
// Renders into its own <g> inside the React-owned <svg> (viz/README). The hex
// layout is 2024-only (PHASE-2 §2.0) — non-2024 elections fall back to OTHER.
export default function HexCartogram({ byId, status, country = 'uk', palette, onHover }) {
  const gRef = useRef(null)
  const [hexes, setHexes] = useState(null)   // [{ id, q, r, name }]
  const [size, setSize] = useState(null)     // { w, h } of the SVG

  // Load + parse the HexJSON once (odd-r, keys are GSS codes = byId keys).
  useEffect(() => {
    let ignore = false
    fetch('/geometry/uk-2024.hexjson')
      .then(r => r.json())
      .then(data => {
        if (ignore) return
        setHexes(Object.entries(data.hexes).map(([id, h]) => ({ id, q: h.q, r: h.r, name: h.n })))
      })
      .catch(err => console.error('Hex geometry load failed:', err))
    return () => { ignore = true }
  }, [])

  // Track SVG pixel size so the cartogram fits the viewport (and refits on resize).
  useEffect(() => {
    const svg = gRef.current?.ownerSVGElement
    if (!svg) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(svg)
    return () => ro.disconnect()
  }, [])

  // Clear the sidebar detail when the pointer/focus leaves the whole cartogram.
  // On the group, not each hex, so moving BETWEEN hexes never flickers to null.
  useEffect(() => {
    if (!onHover) return
    const sel = d3.select(gRef.current)
    const clear = () => onHover(null)
    sel.on('mouseleave', clear).on('focusout', clear)
    return () => sel.on('mouseleave', null).on('focusout', null)
  }, [onHover])

  // Draw / redraw on data, geometry, palette, or size change. `.join()` only, so
  // StrictMode's double-invoke reconciles instead of duplicating (viz/README).
  useEffect(() => {
    const g = gRef.current
    if (!g || status !== 'ready' || !hexes || !size) return
    const w = size.w || 800, h = size.h || 600

    // odd-r offset → unit centres. y is negated so higher r (Orkney) sits at the
    // TOP (north-up): SVG y grows downward, but r grows northward in this HexJSON.
    const laid = hexes.map(hx => ({
      ...hx,
      ux: Math.sqrt(3) * (hx.q + 0.5 * (Math.abs(hx.r) % 2)),
      uy: -1.5 * hx.r,
    }))
    const [minX, maxX] = d3.extent(laid, d => d.ux)
    const [minY, maxY] = d3.extent(laid, d => d.uy)
    // Scale to the tighter axis, leaving one hex-radius (1 unit) of margin each side.
    const s = Math.min(w / (maxX - minX + 2), h / (maxY - minY + 2))
    const offX = (w - (maxX - minX + 2) * s) / 2
    const offY = (h - (maxY - minY + 2) * s) / 2
    const radius = s * 0.92   // slight gap between neighbours

    d3.select(g)
      .selectAll('polygon')
      .data(laid, d => d.id)
      .join('polygon')
      .attr('points', d => hexPoints(offX + (d.ux - minX + 1) * s, offY + (d.uy - minY + 1) * s, radius))
      .attr('stroke', 'var(--color-region-stroke, #ffffff)')
      .attr('stroke-width', 0.5)
      .attr('tabindex', 0)                      // focus-accessible (§3.10)
      .attr('role', 'img')
      .attr('aria-label', d => {
        const row = byId.get(d.id)
        return row ? `${row.constituencyName}: ${row.winner} won by ${row.majority}` : d.name
      })
      // The Map lookup, never .find() (§3.3); fill from the active palette.
      .attr('fill', d => partyColor(country, byId.get(d.id)?.winner, palette))
      // Report the hovered/focused constituency up to the sidebar (§3.10).
      .on('mouseenter', (_e, d) => onHover?.(byId.get(d.id) ?? null))
      .on('focus', (_e, d) => onHover?.(byId.get(d.id) ?? null))

    return () => { d3.select(g).selectAll('*').remove() }
  }, [status, byId, hexes, size, palette, country, onHover])

  return <g ref={gRef} className="viz-hex" />
}
