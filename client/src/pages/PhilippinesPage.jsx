import { useView } from '../context/view-context'
import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

export default function PhilippinesPage() {
  const { viewMode, mapMode } = useView()

  return (
    <div className="country-page">
      <MapContainer viewMode={viewMode} mapMode={mapMode} />
      <InfoPanel country="Philippines" viewMode={viewMode} mapMode={mapMode} />
    </div>
  )
}
