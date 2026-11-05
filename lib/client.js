'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export async function api(url, { method = 'GET', body, token } = {}) {
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { 'x-admin-token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    err.errors = data?.errors
    throw err
  }
  return data
}

// GET a JSON endpoint; refetches when `url` changes (pass null to skip).
export function useApi(url) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(url) })
  const seq = useRef(0)

  const load = useCallback(
    async (silent = false) => {
      if (!url) return
      const id = ++seq.current
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await api(url)
        if (id === seq.current) setState({ data, error: null, loading: false })
      } catch (error) {
        if (id === seq.current) setState((s) => ({ data: silent ? s.data : null, error, loading: false }))
      }
    },
    [url]
  )

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: () => load(true) }
}
