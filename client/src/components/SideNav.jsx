import { useState } from 'react'
import { useView } from '../context/ViewContext'
import GridIcon from './icons/GridIcon'
import ListIcon from './icons/ListIcon'
import TrendIcon from './icons/TrendIcon'
import CrosshairIcon from './icons/CrosshairIcon'
import ChevronLeft from './icons/ChevronLeft'
import ChevronRight from './icons/ChevronRight'
import '../styles/components/sideNav.scss'

const sections = [
  {
    label: 'Views',
    items: [
      { mode: 'overview',   label: 'Overview',  Icon: GridIcon      },
      { mode: 'data',       label: 'Data',       Icon: ListIcon      },
      { mode: 'analytics',  label: 'Analytics',  Icon: TrendIcon     },
      { mode: 'map',        label: 'Map',         Icon: CrosshairIcon },
    ],
  },
]

export default function SideNav() {
  const [expanded, setExpanded] = useState(false)
  const { viewMode, setViewMode } = useView()

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
            {section.items.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                className={`sidenav__item${viewMode === mode ? ' sidenav__item--active' : ''}`}
                onClick={() => setViewMode(mode)}
                title={!expanded ? label : undefined}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
