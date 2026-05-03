import { createContext, useContext, useState } from 'react'

const ViewContext = createContext(null)

export function ViewProvider({ children }) {
  const [viewMode, setViewMode] = useState('overview')
  const [mapMode, setMapMode] = useState('choropleth')
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

export function useView() {
  return useContext(ViewContext)
}
