'use client'
import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/lib/client'
import { monthly, totals } from '@/lib/cashflow'
import { moneyCompact, moneyWhole } from '@/lib/format'
import { MoneyTooltip } from '../components/charts'
import StatCard from '../components/StatCard'
import { ErrorNote, PageTitle, Segmented, Skeleton } from '../components/ui'

const RANGES = { '6M': 6, '1Y': 12, ALL: Infinity }
const tick = { fill: 'var(--muted)', fontSize: 12 }

export default function CashFlowPage() {
  const { data: tx, error, loading, reload } = useApi('/api/transactions')
  const [range, setRange] = useState('1Y')

  const all = useMemo(() => monthly(tx || []), [tx])
  const series = useMemo(() => (Number.isFinite(RANGES[range]) ? all.slice(-RANGES[range]) : all), [all, range])
  const t = useMemo(() => totals(tx || []), [tx])

  if (error) return <ErrorNote onRetry={reload}>Could not load transactions. {error.message}</ErrorNote>

  return (
    <>
      <PageTitle title="Cash Flow" subtitle="Income, expenses and monthly analytics" />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Balance" value={moneyWhole(t.balance)} tone={t.balance >= 0 ? 'text-ink' : 'text-loss'} icon="◍" />
            <StatCard label="Total Income" value={moneyWhole(t.income)} tone="text-gain" icon="▲" />
            <StatCard label="Total Expense" value={moneyWhole(t.expense)} tone="text-loss" icon="▼" />
          </div>

          <Segmented label="Time range" options={Object.keys(RANGES)} value={range} onChange={setRange} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="card p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">Monthly Overview</h2>
                <span className="text-xs text-muted">Income vs Expense</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2ee59d" stopOpacity={0.4} />
                        <stop offset="1" stopColor="#2ee59d" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ff6b86" stopOpacity={0.35} />
                        <stop offset="1" stopColor="#ff6b86" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={moneyCompact} width={56} />
                    <Tooltip content={<MoneyTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#2ee59d" strokeWidth={2.5} fill="url(#inc)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#ff6b86" strokeWidth={2.5} fill="url(#exp)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">Income vs Expense</h2>
                <span className="text-xs text-muted">Monthly comparison</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={moneyCompact} width={56} />
                    <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--line)' }} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#7c4dff" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="expense" name="Expense" fill="#b9a5f2" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
