import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

const PE2022 = {
  parties: [
    { name: 'PFP',       seats: 138, colour: '#c8102e' },
    { name: 'Lakas-CMD', seats: 26,  colour: '#0038a8' },
    { name: 'NPC',       seats: 36,  colour: '#ffcc00' },
    { name: 'NUP',       seats: 24,  colour: '#008000' },
    { name: 'Other',     seats: 55,  colour: '#848787' },
  ],
}

export default function PhilippinesPage() {
  return (
    <div className="country-page">
      <MapContainer />
      <InfoPanel country="Philippines" year="2022" data={PE2022} />
    </div>
  )
}
