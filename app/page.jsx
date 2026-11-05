'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/lib/client'
import { money, moneyWhole, signedMoney, signedPct } from '@/lib/format'
import { useTheme } from './useContext/useContext'
import { AllocationDonut, CLASS_COLORS, PerformanceChart, Sparkline } from './components/charts'
import { ChevronRight, PlusIcon } from './components/icons'
import { Delta, EmptyState, ErrorNote, Segmented, Skeleton } from './components/ui'
import HoldingModal from './components/HoldingModal'

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

function GrowthCard() {
  return (
    <div className="card relative hidden min-h-[170px] overflow-hidden p-5 md:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity=".85" />
            <stop offset="1" stopColor="#3b1d8f" stopOpacity=".3" />
          </linearGradient>
        </defs>
        <circle cx="330" cy="58" r="26" fill="#f4eeff" opacity=".95" />
        <path d="M0 170V120C60 90 110 110 170 100S280 60 340 85 400 80 400 80V170z" fill="url(#hill)" opacity=".8" />
        <path d="M0 170V140C80 120 140 140 220 125S340 100 400 118V170z" fill="#5b2fd1" opacity=".55" />
      </svg>
      <div className="relative">
        <p className="font-bold">Steady Growth</p>
        <p className="mt-1 max-w-[9rem] text-sm text-muted">A brighter tomorrow, together.</p>
      </div>
    </div>
  )
}

function HoldingRow({ h }) {
  const up = (h.dayChangePct ?? 0) >= 0
  return (
    <li className="flex items-center gap-3 rounded-xl bg-surface2/70 px-3 py-2.5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
        style={{ background: CLASS_COLORS[h.asset_class] || '#7c4dff', color: h.asset_class === 'Mutual Funds' ? '#3b1d8f' : '#fff' }}
        aria-hidden="true"
      >
        {h.symbol.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-tight">{h.name}</p>
        <p className="text-xs font-semibold text-soft">{h.symbol}</p>
      </div>
      <span className="hidden sm:block">
        <Sparkline data={h.spark} up={up} />
      </span>
      <div className="text-right">
        <p className="font-bold">{money(h.price)}</p>
        <p className="text-xs text-muted">{moneyWhole(h.value)}</p>
      </div>
      {h.dayChangePct != null ? <Delta value={h.dayChangePct} className="!text-xs" /> : <span className="w-14" />}
    </li>
  )
}

export default function PortfolioPage() {
  const { canWrite } = useTheme()
  const [range, setRange] = useState('1M')
  const [adding, setAdding] = useState(false)
  const pf = useApi('/api/holdings')
  const hist = useApi(`/api/portfolio/history?range=${range}`)

  const reload = async () => {
    await Promise.all([pf.reload(), hist.reload()])
  }

  if (pf.loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full max-w-md" />
        <Skeleton className="h-80 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }
  if (pf.error) return <ErrorNote onRetry={pf.reload}>Could not load your portfolio. {pf.error.message}</ErrorNote>

  const { holdings, totals, allocation, unavailable } = pf.data

  if (!holdings.length) {
    return (
      <div className="card mx-auto max-w-xl">
        <EmptyState
          title="Build your portfolio"
          text="Add the stocks, ETFs, funds and cash you own. Prices and performance update from live market data."
          action={
            canWrite ? (
              <button className="btn btn-primary" onClick={() => setAdding(true)}>
                <PlusIcon size={18} /> Add your first holding
              </button>
            ) : (
              <p className="text-sm text-muted">Switch to Admin mode to add holdings.</p>
            )
          }
        />
        {adding && <HoldingModal onClose={() => setAdding(false)} onSaved={reload} />}
      </div>
    )
  }

  const h = hist.data
  const top = [...holdings].sort((a, b) => b.value - a.value).slice(0, 5)
  const upPeriod = (h?.change ?? 0) >= 0

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 items-start gap-5 md:grid-cols-[1fr_340px]">
        <div>
          <p className="text-sm text-muted">Total Portfolio Value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{money(totals.value)}</p>
          <div className={`mt-3 flex flex-wrap items-center gap-x-2 text-base font-semibold ${upPeriod ? 'text-gain' : 'text-loss'}`}>
            {hist.loading && !h ? (
              <Skeleton className="h-6 w-56" />
            ) : h ? (
              <>
                <span aria-hidden="true">{upPeriod ? '▲' : '▼'}</span>
                <span>{signedPct(h.changePct)}</span>
                <span className="font-medium text-muted">
                  ({signedMoney(h.change)}) {h.label}
                </span>
              </>
            ) : null}
          </div>
          <div className="mt-5">
            <Segmented label="Time range" options={RANGES} value={range} onChange={setRange} />
          </div>
        </div>
        <GrowthCard />
      </section>

      {unavailable.length > 0 && (
        <p role="status" className="rounded-xl bg-[var(--loss-bg)] px-4 py-3 text-sm text-loss">
          Live prices are unavailable for {unavailable.join(', ')}. Their value is shown at cost for now.
        </p>
      )}

      <section className="card p-5 sm:p-6" aria-label="Portfolio performance">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Portfolio Performance</h2>
          <span className="text-xs text-muted">Based on your current holdings</span>
        </div>
        {hist.error ? (
          <ErrorNote onRetry={hist.reload}>Could not load price history. {hist.error.message}</ErrorNote>
        ) : hist.loading && !h ? (
          <Skeleton className="h-[280px] w-full" />
        ) : h?.points.length > 1 ? (
          <div className={hist.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <PerformanceChart points={h.points} range={range} />
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted">Not enough price history for this range yet.</p>
        )}
        {h?.partial?.length > 0 && (
          <p className="mt-2 text-xs text-muted">History unavailable for {h.partial.join(', ')}; the chart excludes it.</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl text-soft" aria-hidden="true">
            ◍
          </span>
          <div>
            <p className="text-sm text-muted">Total Invested</p>
            <p className="text-2xl font-extrabold">{money(totals.invested)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 border-[color:var(--gain)]/30 bg-[var(--gain-bg)] p-5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gain-bg)] text-2xl text-gain"
            aria-hidden="true"
          >
            {totals.gain >= 0 ? '▲' : '▼'}
          </span>
          <div className="flex-1">
            <p className="text-sm text-muted">Total Gain</p>
            <p className={`text-2xl font-extrabold ${totals.gain >= 0 ? 'text-gain' : 'text-loss'}`}>{signedMoney(totals.gain)}</p>
          </div>
          <span className={`text-base font-bold ${totals.gain >= 0 ? 'text-gain' : 'text-loss'}`}>{signedPct(totals.gainPct)}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-label="Portfolio allocation">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Portfolio Allocation</h2>
            <Link href="/holdings" className="inline-flex items-center gap-1 py-2.5 pl-2 text-sm font-semibold text-soft hover:text-ink">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <AllocationDonut allocation={allocation} total={totals.value} size={200} />
            <ul className="w-full flex-1 divide-y divide-line text-sm">
              {allocation.map((a) => (
                <li key={a.asset_class} className="flex items-center gap-3 py-2.5">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: CLASS_COLORS[a.asset_class] }} />
                  <span className="flex-1 font-medium">{a.asset_class}</span>
                  <span className="w-12 text-right text-muted">{Math.round(a.pct)}%</span>
                  <span className="w-24 text-right font-semibold">{money(a.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-label="Top holdings">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Top Holdings</h2>
            <Link href="/holdings" className="inline-flex items-center gap-1 py-2.5 pl-2 text-sm font-semibold text-soft hover:text-ink">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <ul className="space-y-2">
            {top.map((x) => (
              <HoldingRow key={x.id} h={x} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
