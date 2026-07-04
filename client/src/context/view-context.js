import { createContext, useContext } from 'react'

// Context object + hook live here (no component export) so the provider file
// stays component-only and React Fast Refresh keeps working.
export const ViewContext = createContext(null)

export const useView = () => useContext(ViewContext)
