import { createContext, useContext } from 'react'

// Context object + hook live here (no component export) so the provider file
// can stay component-only and keep React Fast Refresh working.
export const ThemeContext = createContext(null)

export const useTheme = () => useContext(ThemeContext)
