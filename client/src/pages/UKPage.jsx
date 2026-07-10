import { useMemo, useState, useEffect } from 'react'
import { useView } from '../context/view-context'
import { useTheme } from '../context/theme-context'
import { useElectionData } from '../hooks/useElectionData'
import MapContainer from '../components/MapContainer'
import ChoroplethMap from '../viz/ChoroplethMap'
import HexCartogram from '../viz/HexCartogram'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

export default function UKPage() {
  const { viewMode, mapMode, selectedYear } = useView()
  const { palette } = useTheme()
  const { byId, electionId, status, error } = useElectionData('uk', selectedYear)

  // Seats won per party, derived from the ONE Map (§1.6) — feeds the InfoPanel tally.
  const winners = useMemo(() => {
    const tally = new Map()
    for (const row of byId.values()) tally.set(row.winner, (tally.get(row.winner) ?? 0) + 1)
    return [...tally.entries()].sort((a, b) => b[1] - a[1])
  }, [byId])

  // The constituency the pointer/keyboard is currently on — the map reports it via
  // `onHover`, the sidebar shows its detail. Cleared when the election changes so a
  // stale constituency from the previous fetch never lingers.
  const [hovered, setHovered] = useState(null)
  useEffect(() => { setHovered(null) }, [electionId])

  // `mapMode` (from the SideNav) picks the renderer; both read the one fetch's
  // `byId`/`status` + active palette. Hex is 2024-only geometry (PHASE-2 §2.0).
  const viz = mapMode === 'hex'
    ? <HexCartogram byId={byId} status={status} country="uk" palette={palette} onHover={setHovered} />
    : <ChoroplethMap byId={byId} status={status} country="uk" electionId={electionId} palette={palette} onHover={setHovered} />

  return (
    <div className="country-page">
      <MapContainer viewMode={viewMode} mapMode={mapMode}>
        {viz}
      </MapContainer>
      <InfoPanel
        country="United Kingdom"
        viewMode={viewMode}
        mapMode={mapMode}
        hovered={hovered}
        election={{ electionId, status, error, seatCount: byId.size, winners }}
      />
    </div>
  )
}
