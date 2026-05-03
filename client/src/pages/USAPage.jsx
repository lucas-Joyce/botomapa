import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

const HE2020 = {
  parties: [
    { name: 'Democrat',    seats: 222, colour: '#1a6ed8' },
    { name: 'Republican',  seats: 213, colour: '#e22c2c' },
  ],
}

export default function USAPage() {
  return (
    <div className="country-page">
      <MapContainer />
      <InfoPanel country="United States" year="2020" data={HE2020} />
    </div>
  )
}
