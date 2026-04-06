'use client'
import { useContext, createContext, useState, useEffect } from 'react'

const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setMode(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove(mode === 'light' ? 'dark' : 'light')
    document.documentElement.classList.add(mode)
    localStorage.setItem('theme', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ mode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  return (
    useContext(ThemeContext) || {
      mode: 'light',
      toggleTheme: () => {},
    }
  )
}
