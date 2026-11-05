'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../useContext/useContext'
import { Modal, Field } from './ui'
import {
  BulbIcon,
  FileIcon,
  FlowIcon,
  LayersIcon,
  ListIcon,
  Logo,
  MoonIcon,
  PieIcon,
  SearchIcon,
  ShieldIcon,
  SunIcon,
} from './icons'

const NAV = [
  { href: '/', label: 'Portfolio', short: 'Portfolio', Icon: PieIcon },
  { href: '/holdings', label: 'Holdings', short: 'Holdings', Icon: LayersIcon },
  { href: '/cashflow', label: 'Cash Flow', short: 'Cash Flow', Icon: FlowIcon },
  { href: '/Transactions', label: 'Transactions', short: 'Activity', Icon: ListIcon },
  { href: '/Insights', label: 'Insights', short: 'Insights', Icon: BulbIcon },
  { href: '/Reports', label: 'Reports', short: 'Reports', Icon: FileIcon },
]

const isActive = (pathname, href) =>
  href === '/' ? pathname === '/' : pathname.toLowerCase().startsWith(href.toLowerCase())

function TokenPrompt() {
  const { askToken, closeTokenPrompt, enterAdmin } = useTheme()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!askToken) return null

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await enterAdmin(value)
      setValue('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Switch to Admin" onClose={closeTokenPrompt}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">Enter the admin token to add, edit or delete data.</p>
        <Field label="Admin token" error={error}>
          <input
            type="password"
            className="field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            required
          />
        </Field>
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Checking...' : 'Unlock'}
        </button>
      </form>
    </Modal>
  )
}

export default function AppShell({ children }) {
  const pathname = usePathname()
  const { mode, toggleTheme, role, toggleRole } = useTheme()

  const roleBtn = (
    <button
      type="button"
      onClick={toggleRole}
      title={role === 'admin' ? 'Admin mode: you can edit data. Click to switch to Viewer.' : 'Viewer mode: read-only. Click to switch to Admin.'}
      aria-label={role === 'admin' ? 'Admin mode (click for Viewer)' : 'Viewer mode (click for Admin)'}
      className={`inline-flex h-10 w-10 items-center justify-center gap-1.5 rounded-full border text-xs font-bold min-[420px]:w-auto min-[420px]:px-3 ${
        role === 'admin' ? 'border-primary/60 bg-primary/15 text-soft' : 'border-line bg-surface2 text-muted'
      }`}
    >
      <ShieldIcon size={16} />
      <span className="hidden min-[420px]:inline">{role === 'admin' ? 'Admin' : 'Viewer'}</span>
    </button>
  )

  const themeBtn = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface2 text-soft hover:text-ink"
    >
      {mode === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  )

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/80 p-5 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Logo size={42} />
          <span>
            <span className="block text-xl font-extrabold leading-tight">Wealthly</span>
            <span className="block text-[10px] font-semibold tracking-[0.22em] text-muted">INVEST · GROW · BELONG</span>
          </span>
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1.5">
          {NAV.map(({ href, label, Icon }) => {
            const on = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  on ? 'bg-primary text-white shadow-[0_6px_22px_rgba(124,77,255,0.45)]' : 'text-muted hover:bg-surface2 hover:text-ink'
                }`}
              >
                <Icon size={19} /> {label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          {roleBtn}
          {themeBtn}
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-[var(--page)]/90 px-4 py-3 backdrop-blur lg:justify-end lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 lg:hidden">
          <Logo size={34} />
          <span>
            <span className="block text-lg font-extrabold leading-tight">Wealthly</span>
            <span className="block whitespace-nowrap text-[8px] font-semibold tracking-[0.16em] text-muted">INVEST · GROW · BELONG</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/holdings?add=1"
            aria-label="Search markets and add a holding"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface2 text-soft hover:text-ink"
          >
            <SearchIcon size={18} />
          </Link>
          <span className="lg:hidden">{roleBtn}</span>
          <span className="lg:hidden">{themeBtn}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12">{children}</main>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur lg:hidden"
      >
        {NAV.map(({ href, short, Icon }) => {
          const on = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? 'page' : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                on ? 'text-soft' : 'text-muted'
              }`}
            >
              <span className={`flex h-7 w-10 items-center justify-center rounded-full ${on ? 'bg-primary text-white' : ''}`}>
                <Icon size={18} />
              </span>
              <span className="w-full truncate text-center">{short}</span>
            </Link>
          )
        })}
      </nav>

      <TokenPrompt />
    </div>
  )
}
