import { useView } from '../context/ViewContext'
import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

export default function FrancePage() {
  const { viewMode, mapMode } = useView()

  return (
    <div className="country-page">
      <MapContainer viewMode={viewMode} mapMode={mapMode} />
      <InfoPanel country="France" viewMode={viewMode} mapMode={mapMode} />
    </div>
  )
}
