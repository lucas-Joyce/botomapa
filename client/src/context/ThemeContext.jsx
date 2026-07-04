import { useEffect, useState } from 'react'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [palette, setPalette] = useState(() => localStorage.getItem('palette') || 'standard')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
    localStorage.setItem('palette', palette)
  }, [palette])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  const togglePalette = () =>
    setPalette(p => (p === 'standard' ? 'colourblind' : 'standard'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette, togglePalette }}>
      {children}
    </ThemeContext.Provider>
  )
}
