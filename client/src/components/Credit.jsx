import { useState } from 'react'
import '../styles/components/credit.scss'

const credits = [
  { name: 'D3.js',                        role: 'Maps & cartograms',            link: 'd3js.org'                     },
  { name: 'React + Vite',                 role: 'App framework & build',        link: 'react.dev'                    },
  { name: 'Okabe–Ito',                    role: 'Colourblind-safe palette',     link: 'jfly.uni-koeln.de/color'      },
  { name: 'House of Commons Library',     role: 'UK election data',             link: 'commonslibrary.parliament.uk' },
  { name: 'Office for National Statistics', role: 'Constituency boundaries — OGL v3', link: 'ons.gov.uk'             },
]

function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {open
        ? <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        : <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      }
    </svg>
  )
}

export default function Credit() {
  const [open, setOpen] = useState(false)

  return (
    <div className="credit">
      <div className={`credit__panel${open ? ' credit__panel--open' : ''}`}>
        <div className="credit__panel-inner">
          <div className="credit__panel-title">Credits</div>
          <div className="credit__grid">
            {credits.map(({ name, role, link }) => (
              <div key={name} className="credit__card">
                <div className="credit__card-name">{name}</div>
                <div className="credit__card-role">{role}</div>
                <a
                  href={`https://${link}`}
                  className="credit__card-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="credit__bar" onClick={() => setOpen(prev => !prev)}>
        <div className={`credit__bar-label${open ? ' credit__bar-label--open' : ''}`}>
          <ChevronIcon open={open} />
          Credits
        </div>
        <span className="credit__bar-hint">
          {open ? 'click to close' : 'click to expand'}
        </span>
      </div>
    </div>
  )
}
