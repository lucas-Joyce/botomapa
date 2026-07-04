import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { countryFromPath, countryBySlug } from '../config/countries'
import { electionsFor } from '../config/elections'
import '../styles/components/sideNav.scss'

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
})
// Parse as local noon so the formatted day never slips across a timezone boundary.
const formatDate = (iso) => dateFmt.format(new Date(`${iso}T12:00:00`))

export default function SideNav() {
  const [expanded, setExpanded] = useState(false)
  const { pathname } = useLocation()

  const country = countryFromPath(pathname)
  const elections = electionsFor(country)

  // Selected election drives the map/data (wired up in Phase 1+). Derived during
  // render: if the stored id isn't in the current country's list (e.g. after
  // navigating), fall back to the most recent election.
  const [selectedId, setSelectedId] = useState(null)
  const activeId = elections.some(e => e.id === selectedId)
    ? selectedId
    : (elections[0]?.id ?? null)

  return (
    <aside className={`sidenav${expanded ? ' sidenav--expanded' : ''}`}>
      <div
        className="sidenav__toggle"
        onClick={() => setExpanded(prev => !prev)}
        title={expanded ? 'Collapse' : 'Expand'}
      >
        {expanded ? <ChevronLeft /> : <ChevronRight />}
      </div>

      <div className="sidenav__inner">
        <div className="sidenav__section-label">Data</div>

        {country ? (
          <>
            <div className="sidenav__country">{countryBySlug.get(country)?.name}</div>
            {elections.map(({ id, year, type, date }) => (
              <button
                key={id}
                type="button"
                className={`sidenav__election${id === activeId ? ' sidenav__election--active' : ''}`}
                onClick={() => setSelectedId(id)}
                aria-pressed={id === activeId}
                title={!expanded ? `${year} · ${type}` : undefined}
              >
                <span className="sidenav__election-year">{year}</span>
                <span className="sidenav__election-meta">
                  <span className="sidenav__election-type">{type}</span>
                  <span className="sidenav__election-date">{formatDate(date)}</span>
                </span>
              </button>
            ))}
          </>
        ) : (
          <div className="sidenav__hint">Select a country to see its elections.</div>
        )}
      </div>
    </aside>
  )
}
