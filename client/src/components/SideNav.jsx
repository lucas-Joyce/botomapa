import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/components/sideNav.scss'

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 5h12M2 8.5h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 11.5L5.5 7.5L8.5 9.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CrosshairIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 2v2.5M8 11.5V14M2 8h2.5M11.5 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

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

const sections = [
  {
    label: 'Views',
    items: [
      { to: '/',          label: 'Overview',   Icon: GridIcon      },
      { to: '/data',      label: 'Data',        Icon: ListIcon      },
      { to: '/analytics', label: 'Analytics',   Icon: TrendIcon     },
      { to: '/map',       label: 'Map',         Icon: CrosshairIcon },
    ],
  },
]

export default function SideNav() {
  const [expanded, setExpanded] = useState(false)

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
        {sections.map(section => (
          <div key={section.label}>
            <div className="sidenav__section-label">{section.label}</div>
            {section.items.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidenav__item${isActive ? ' sidenav__item--active' : ''}`
                }
                title={!expanded ? label : undefined}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
