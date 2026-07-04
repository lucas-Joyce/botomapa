import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/theme-context'
import { countryFromPath } from '../config/countries'
import { emitPartyColors } from '../config/themeBridge'

// Route-aware bridge: keeps the `--party-*` CSS custom properties in sync with
// the active country and the selected palette. Renders nothing.
export default function PaletteEmitter() {
  const { palette } = useTheme()
  const { pathname } = useLocation()
  const country = countryFromPath(pathname) ?? 'uk'

  useEffect(() => {
    emitPartyColors(country, palette)
  }, [country, palette])

  return null
}
