import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import '../styles/components/navBar.scss'

const countries = [
  { name: 'United Kingdom', path: '/uk' },
  { name: 'United States', path: '/usa' },
  { name: 'France', path: '/france' },
  { name: 'Germany', path: '/germany' },
  { name: 'Philippines', path: '/philippines' },
]

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 10A6 6 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function NavBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">LJ</NavLink>

      <ul className="navbar__countries">
        {countries.map(({ name, path }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        <button
          className="navbar__icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <button className="navbar__icon-btn" aria-label="Menu">
          <HamburgerIcon />
        </button>
      </div>
    </nav>
  )
}
