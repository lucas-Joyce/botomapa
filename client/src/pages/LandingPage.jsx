import { Link } from 'react-router-dom'
import '../styles/pages/landingPage.scss'

const countries = [
  { name: 'United Kingdom', path: '/uk',          clr: '#cf142b' },
  { name: 'United States',  path: '/usa',         clr: '#3c3b6e' },
  { name: 'France',         path: '/france',      clr: '#002395' },
  { name: 'Germany',        path: '/germany',     clr: '#ffcc00' },
  { name: 'Philippines',    path: '/philippines', clr: '#0038a8' },
]

const LandingPage = () => {
  return (
    <div className="landing">
      <h1 className="landing__title">Political Map</h1>
      <div className="landing__cards">
        {countries.map(({ name, path, clr }) => (
          <Link
            key={path}
            to={path}
            className="card"
            style={{ '--clr': clr }}
          >
            <div className="imgBx">
              <img src="" alt="" />
            </div>
            <img src="" alt="" className="c3d" />
            <h2>{name}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LandingPage
