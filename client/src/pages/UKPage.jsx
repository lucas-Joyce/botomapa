import { useMemo } from 'react'
import { useView } from '../context/view-context'
import { useElectionData } from '../hooks/useElectionData'
import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

export default function UKPage() {
  const { viewMode, mapMode, selectedYear } = useView()
  const { byId, electionId, status, error } = useElectionData('uk', selectedYear)

  // Phase-1 proof (§1.6): seats won per party, derived from the ONE Map — no map is
  // drawn yet. Phase 2 replaces this readout with the choropleth/hex.
  const winners = useMemo(() => {
    const tally = new Map()
    for (const row of byId.values()) tally.set(row.winner, (tally.get(row.winner) ?? 0) + 1)
    return [...tally.entries()].sort((a, b) => b[1] - a[1])
  }, [byId])

  return (
    <div className="country-page">
      <MapContainer viewMode={viewMode} mapMode={mapMode} />
      <InfoPanel
        country="United Kingdom"
        viewMode={viewMode}
        mapMode={mapMode}
        election={{ electionId, status, error, seatCount: byId.size, winners }}
      />
    </div>
  )
}
