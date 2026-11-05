'use client'
import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons'
import { signedPct } from '@/lib/format'

export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('input, select, button:not([data-close])')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-b-[1.25rem] sm:p-6 ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface2 hover:text-ink"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-loss">{error}</span>}
    </label>
  )
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-2xl border border-line bg-surface2 p-1"
    >
      {options.map((o) => {
        const on = o === value
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o)}
            className={`min-w-[3.1rem] rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              on ? 'bg-primary text-white shadow-[0_4px_16px_rgba(124,77,255,0.5)]' : 'text-muted hover:text-ink'
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

export function Delta({ value, className = '', children }) {
  const up = value >= 0
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-bold ${
        up ? 'bg-[var(--gain-bg)] text-gain' : 'bg-[var(--loss-bg)] text-loss'
      } ${className}`}
    >
      {children ?? signedPct(value)}
    </span>
  )
}

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden="true" />

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface2 text-2xl text-soft">◌</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorNote({ children, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--loss-bg)] px-4 py-3 text-sm text-loss">
      <span>{children}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline">
          Try again
        </button>
      )}
    </div>
  )
}

export function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="max-w-full min-w-0">{actions}</div>}
    </div>
  )
}
