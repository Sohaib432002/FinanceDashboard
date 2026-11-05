'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/client'
import { money } from '@/lib/format'
import { useWriteApi } from '../useContext/useContext'
import { Field, Modal } from './ui'
import { SearchIcon } from './icons'

const CLASSES = ['Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Cash']

// Add a new holding (with live symbol search) or edit an existing one.
export default function HoldingModal({ holding, onClose, onSaved }) {
  const editing = Boolean(holding)
  const write = useWriteApi()

  const [assetClass, setAssetClass] = useState(holding?.asset_class || 'Stocks')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState(editing ? { symbol: holding.symbol, name: holding.name } : null)
  const [price, setPrice] = useState(null)
  const [shares, setShares] = useState(editing ? String(holding.shares) : '')
  const [cost, setCost] = useState(editing ? String(holding.avg_cost) : '')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const isCash = assetClass === 'Cash'

  // debounced symbol search
  useEffect(() => {
    if (editing || isCash || picked || query.trim().length < 1) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        const data = await res.json()
        setResults(res.ok ? data : [])
        if (!res.ok) setError(data.error)
        else setError('')
      } catch (e) {
        if (e.name !== 'AbortError') setError('Search is unavailable right now.')
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query, picked, isCash, editing])

  const pick = async (r) => {
    setPicked({ symbol: r.symbol, name: r.name })
    setAssetClass(r.asset_class)
    setResults([])
    setError('')
    try {
      const q = await api(`/api/market/quote?symbol=${encodeURIComponent(r.symbol)}`)
      setPrice(q.price)
      setCost((c) => c || String(q.price))
    } catch (e) {
      setPicked(null)
      setError(e.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setFieldErrors({})
    try {
      const body = {
        asset_class: assetClass,
        symbol: picked?.symbol,
        name: picked?.name,
        shares: Number(shares),
        avg_cost: isCash ? 1 : Number(cost),
      }
      if (editing) await write(`/api/holdings/${holding.id}`, { method: 'PUT', body })
      else await write('/api/holdings', { method: 'POST', body })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors || {})
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = isCash || picked

  return (
    <Modal title={editing ? `Edit ${holding.symbol}` : 'Add a holding'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {!editing && (
          <Field label="Asset class" error={fieldErrors.asset_class}>
            <select
              className="field"
              value={assetClass}
              onChange={(e) => {
                setAssetClass(e.target.value)
                setPicked(null)
                setPrice(null)
              }}
            >
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}

        {editing && !isCash && (
          <Field label="Asset class">
            <select className="field" value={assetClass} onChange={(e) => setAssetClass(e.target.value)}>
              {CLASSES.filter((c) => c !== 'Cash').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}

        {!isCash && !editing && (
          <div>
            <Field label="Search stock, ETF or fund" error={fieldErrors.symbol}>
              <div className="relative">
                <SearchIcon size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="field pl-10"
                  placeholder="e.g. AAPL, Vanguard S&P 500"
                  value={picked ? `${picked.symbol} · ${picked.name}` : query}
                  onChange={(e) => {
                    setPicked(null)
                    setPrice(null)
                    setQuery(e.target.value)
                  }}
                  autoComplete="off"
                />
              </div>
            </Field>
            {searching && <p className="mt-2 text-xs text-muted">Searching...</p>}
            {results.length > 0 && (
              <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-line bg-surface2">
                {results.map((r) => (
                  <li key={r.symbol}>
                    <button
                      type="button"
                      onClick={() => pick(r)}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-primary/15"
                    >
                      <span className="min-w-0">
                        <span className="block font-bold">{r.symbol}</span>
                        <span className="block truncate text-xs text-muted">{r.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">{r.exchange}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!searching && !picked && query.trim() && results.length === 0 && !error && (
              <p className="mt-2 text-xs text-muted">Type a name or ticker, then pick a result.</p>
            )}
          </div>
        )}

        {editing && !isCash && (
          <p className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm">
            <span className="font-bold">{holding.symbol}</span> <span className="text-muted">· {holding.name}</span>
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isCash ? 'Cash amount ($)' : 'Shares'} error={fieldErrors.shares}>
            <input
              className="field"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
            />
          </Field>
          {!isCash && (
            <Field
              label="Average cost per share ($)"
              error={fieldErrors.avg_cost}
              hint={price ? `Current price ${money(price)}` : undefined}
            >
              <input
                className="field"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </Field>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-[var(--loss-bg)] px-3.5 py-2.5 text-sm text-loss">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1" disabled={busy || !canSubmit}>
            {busy ? 'Saving...' : editing ? 'Save changes' : 'Add holding'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
