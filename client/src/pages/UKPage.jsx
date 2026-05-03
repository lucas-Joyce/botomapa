import MapContainer from '../components/MapContainer'
import InfoPanel from '../components/InfoPanel'
import '../styles/pages/countryPage.scss'

const GE2019 = {
  parties: [
    { name: 'Conservative',       seats: 365, colour: '#0004ff' },
    { name: 'Labour',              seats: 202, colour: '#ff0000' },
    { name: 'Scottish National',   seats: 48,  colour: '#ffff00' },
    { name: 'Liberal Democrat',    seats: 11,  colour: '#FAA61A' },
    { name: 'Democratic Unionist', seats: 8,   colour: '#d1ce02' },
    { name: 'Other',               seats: 16,  colour: '#848787' },
  ],
}

export default function UKPage() {
  return (
    <div className="country-page">
      <MapContainer />
      <InfoPanel country="United Kingdom" year="2019" data={GE2019} />
    </div>
  )
}
