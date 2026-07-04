// Bridges the JS colour source of truth (colorMaps.js) to CSS custom properties,
// so D3 fills and SCSS read the same values (build-plan-v2 §2.2).
// Call emitPartyColors() once on mount and again on every palette/country change.
import { partyColors, OTHER } from './colorMaps'

// Write the active country's palette onto :root as `--party-<code>` variables.
export function emitPartyColors(country, palette = 'standard') {
  const map = partyColors[palette]?.[country] ?? partyColors.standard[country]
  if (!map) return
  const root = document.documentElement
  for (const [party, hex] of Object.entries(map)) {
    root.style.setProperty(`--party-${party.toLowerCase()}`, hex)
  }
}

// Resolve a single party's colour from the active palette (for D3 `fill`).
export function partyColor(country, party, palette = 'standard') {
  const map = partyColors[palette]?.[country] ?? {}
  return map[party] ?? map[OTHER] ?? '#999999'
}
