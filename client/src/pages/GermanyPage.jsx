import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

const BE2021 = {
  parties: [
    { name: 'SPD',      seats: 206, colour: '#E3000F' },
    { name: 'CDU/CSU',  seats: 196, colour: '#383838' },
    { name: 'Greens',   seats: 118, colour: '#46962b' },
    { name: 'FDP',      seats: 92,  colour: '#ffed00' },
    { name: 'AfD',      seats: 83,  colour: '#009ee0' },
    { name: 'Linke',    seats: 39,  colour: '#BE3075' },
    { name: 'Other',    seats: 2,   colour: '#848787' },
  ],
}

export default function GermanyPage() {
  return (
    <div className="country-page">
      <MapContainer />
      <InfoPanel country="Germany" year="2021" data={BE2021} />
    </div>
  )
}
