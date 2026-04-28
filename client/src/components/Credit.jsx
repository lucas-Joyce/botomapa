import { useState } from 'react'
import '../styles/components/credit.scss'

const credits = [
  { name: 'Jane Smith',   role: 'Original design',     link: 'github.com/janesmith' },
  { name: 'Acme UI Kit',  role: 'Component library',   link: 'acme.design'           },
  { name: 'Open Icons',   role: 'Icon set — MIT',       link: 'openicons.dev'         },
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
