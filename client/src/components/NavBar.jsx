import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/theme-context'
import { countries } from '../config/countries'
import '../styles/components/navBar.scss'

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

// Split disc — signals the colour-vision / palette toggle.
function PaletteIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" opacity={active ? 1 : 0.55}/>
    </svg>
  )
}

export default function NavBar() {
  const { theme, toggleTheme, palette, togglePalette } = useTheme()
  const colourblind = palette === 'colourblind'

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">LJ</NavLink>

      <ul className="navbar__countries">
        {countries.map(({ name, slug, active }) => (
          <li key={slug}>
            {active ? (
              <NavLink
                to={`/${slug}`}
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                {name}
              </NavLink>
            ) : (
              // Stub country — not yet navigable. Shown but disabled until Phase 5+.
              <span className="navbar__link navbar__link--soon" aria-disabled="true" title="Coming soon">
                {name}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        <button
          className={`navbar__icon-btn${colourblind ? ' navbar__icon-btn--on' : ''}`}
          onClick={togglePalette}
          aria-pressed={colourblind}
          aria-label={colourblind ? 'Use standard party colours' : 'Use colourblind-safe colours'}
          title={colourblind ? 'Colourblind-safe palette (on)' : 'Colourblind-safe palette (off)'}
        >
          <PaletteIcon active={colourblind} />
        </button>

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
