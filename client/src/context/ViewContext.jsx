import { useState } from 'react'
import { ViewContext } from './view-context'

export function ViewProvider({ children }) {
  const [viewMode, setViewMode] = useState('overview')
  const [mapMode, setMapMode] = useState('choropleth')
  // Holds the selected election **id** (e.g. 'uk-2024'), not a bare year — the
  // id is the key into elections config + processed data. Set by the SideNav.
  const [selectedYear, setSelectedYear] = useState(null)
  const [comparisonMode, setComparisonMode] = useState(false)

  return (
    <ViewContext.Provider value={{
      viewMode, setViewMode,
      mapMode, setMapMode,
      selectedYear, setSelectedYear,
      comparisonMode, setComparisonMode,
    }}>
      {children}
    </ViewContext.Provider>
  )
}
