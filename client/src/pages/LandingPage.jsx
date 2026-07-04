import { Link } from 'react-router-dom'
import { countries } from '../config/countries'
import '../styles/pages/landingPage.scss'

const LandingPage = () => {
  return (
    <div className="landing">
      <h1 className="landing__title">BotoMapa</h1>
      <ul className="landing__list">
        {countries.map(({ name, slug }) => (
          <li key={slug} className="landing__item">
            <Link to={`/${slug}`} className="landing__link">{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LandingPage
