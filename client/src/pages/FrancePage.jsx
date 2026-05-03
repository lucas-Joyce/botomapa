import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

const LE2022 = {
  parties: [
    { name: 'Ensemble',  seats: 245, colour: '#ffcc00' },
    { name: 'NUPES',     seats: 131, colour: '#bb1919' },
    { name: 'RN',        seats: 89,  colour: '#003189' },
    { name: 'LR',        seats: 64,  colour: '#0066cc' },
    { name: 'Other',     seats: 28,  colour: '#848787' },
  ],
}

export default function FrancePage() {
  return (
    <div className="country-page">
      <MapContainer />
      <InfoPanel country="France" year="2022" data={LE2022} />
    </div>
  )
}
