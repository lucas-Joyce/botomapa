import { Link } from 'react-router-dom'
import '../styles/pages/landingPage.scss'

const countries = [
  { name: 'United Kingdom', path: '/uk' },
  { name: 'United States', path: '/usa' },
  { name: 'France', path: '/france' },
  { name: 'Germany', path: '/germany' },
  { name: 'Philippines', path: '/philippines' },
]

const LandingPage = () => {
  return (
    <div className="landing">
      <h1 className="landing__title">Political Map</h1>
      <ul className="landing__list">
        {countries.map(({ name, path }) => (
          <li key={path} className="landing__item">
            <Link to={path} className="landing__link">{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LandingPage
