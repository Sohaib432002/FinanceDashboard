'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { api } from '@/lib/client'

const AppContext = createContext(null)
const TOKEN_KEY = 'admin-token'

// Theme lives on <html class="light"> (set before first paint by a script in layout.jsx).
const themeListeners = new Set()
const readTheme = () => (document.documentElement.classList.contains('light') ? 'light' : 'dark')
const subscribeTheme = (cb) => {
  themeListeners.add(cb)
  return () => themeListeners.delete(cb)
}
function writeTheme(next) {
  document.documentElement.classList.toggle('light', next === 'light')
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* storage unavailable */
  }
  themeListeners.forEach((cb) => cb())
}

export const ThemeProvider = ({ children }) => {
  const mode = useSyncExternalStore(subscribeTheme, readTheme, () => 'dark')

  // Admin mode: when the server has ADMIN_TOKEN set, writes need that token.
  const [protectedWrites, setProtectedWrites] = useState(false)
  const [token, setToken] = useState('')
  const [role, setRole] = useState('admin')
  const [askToken, setAskToken] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const saved = sessionStorage.getItem(TOKEN_KEY) || ''
        const res = await fetch('/api/session', {
          cache: 'no-store',
          headers: saved ? { 'x-admin-token': saved } : {},
        }).then((r) => r.json())
        if (cancelled) return
        setProtectedWrites(res.protected)
        if (!res.protected) setRole('admin')
        else if (saved && res.valid) {
          setToken(saved)
          setRole('admin')
        } else setRole('viewer')
      } catch {
        /* keep defaults */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleTheme = useCallback(() => writeTheme(readTheme() === 'dark' ? 'light' : 'dark'), [])

  const enterAdmin = useCallback(
    async (candidate) => {
      if (!protectedWrites) return setRole('admin')
      const res = await fetch('/api/session', {
        cache: 'no-store',
        headers: { 'x-admin-token': candidate },
      }).then((r) => r.json())
      if (!res.valid) throw new Error('That token is not correct.')
      sessionStorage.setItem(TOKEN_KEY, candidate)
      setToken(candidate)
      setRole('admin')
      setAskToken(false)
    },
    [protectedWrites]
  )

  const toggleRole = useCallback(() => {
    if (role === 'admin') {
      sessionStorage.removeItem(TOKEN_KEY)
      setToken('')
      setRole('viewer')
    } else if (protectedWrites) setAskToken(true)
    else setRole('admin')
  }, [role, protectedWrites])

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      role,
      canWrite: role === 'admin',
      token,
      toggleRole,
      enterAdmin,
      askToken,
      closeTokenPrompt: () => setAskToken(false),
    }),
    [mode, toggleTheme, role, token, toggleRole, enterAdmin, askToken]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const fallback = { mode: 'dark', toggleTheme() {}, role: 'viewer', canWrite: false, token: '', toggleRole() {} }
export const useTheme = () => useContext(AppContext) || fallback
export const useAdmin = useTheme

// Convenience: call the API with the current admin token.
export function useWriteApi() {
  const { token } = useTheme()
  return useCallback((url, opts = {}) => api(url, { ...opts, token }), [token])
}
