'use client'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/lib/client'
import { byCategory, monthly, totals, yearsOf } from '@/lib/cashflow'
import { money, moneyCompact, moneyWhole } from '@/lib/format'
import { MoneyTooltip } from '../components/charts'
import StatCard from '../components/StatCard'
import { ErrorNote, PageTitle, Segmented, Skeleton } from '../components/ui'

const tick = { fill: 'var(--muted)', fontSize: 12 }
const PIE = ['#2ee59d', '#ff6b86']

function CategoryBars({ title, rows, color }) {
  const top = rows.slice(0, 6)
  const max = top[0]?.value || 1
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {top.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No data for this period.</p>
      ) : (
        <ul className="space-y-3.5">
          {top.map((r) => (
            <li key={r.name}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="font-bold">{money(r.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface2">
                <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function InsightsPage() {
  const { data: tx, error, loading, reload } = useApi('/api/transactions')
  const [year, setYear] = useState('All')

  const years = useMemo(() => yearsOf(tx || []), [tx])
  const scoped = useMemo(() => (year === 'All' ? tx || [] : (tx || []).filter((t) => t.date.startsWith(year))), [tx, year])
  const t = useMemo(() => totals(scoped), [scoped])
  const months = useMemo(() => {
    const all = monthly(scoped)
    // For a single year show all 12 months so the axis is stable
    return year === 'All' ? all.slice(-12) : all
  }, [scoped, year])
  const split = [
    { name: 'Income', value: t.income },
    { name: 'Expense', value: t.expense },
  ]
  const savingsRate = t.income > 0 ? Math.round(((t.income - t.expense) / t.income) * 100) : 0

  if (error) return <ErrorNote onRetry={reload}>Could not load transactions. {error.message}</ErrorNote>

  return (
    <>
      <PageTitle
        title="Insights"
        subtitle="Where your money comes from and where it goes"
        actions={years.length > 0 && <Segmented label="Year" options={['All', ...years]} value={year} onChange={setYear} />}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Income" value={moneyWhole(t.income)} tone="text-gain" icon="▲" />
            <StatCard label="Total Expenses" value={moneyWhole(t.expense)} tone="text-loss" icon="▼" />
            <StatCard label="Net Balance" value={moneyWhole(t.balance)} tone={t.balance >= 0 ? 'text-ink' : 'text-loss'} icon="◍" hint={`Savings rate ${savingsRate}%`} />
            <StatCard label="Transactions" value={t.count} icon="≡" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="card p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold">Income vs Expense by month</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={16} />
                    <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={moneyCompact} width={56} />
                    <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--line)' }} />
                    <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#2ee59d" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="expense" name="Expense" fill="#ff6b86" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold">Income vs Expense</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={split} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={4} stroke="var(--surface)" isAnimationActive={false}>
                      {split.map((s, i) => (
                        <Cell key={s.name} fill={PIE[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<MoneyTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <CategoryBars title="Top expense categories" rows={byCategory(scoped, 'expense')} color="#ff6b86" />
            <CategoryBars title="Top income sources" rows={byCategory(scoped, 'income')} color="#2ee59d" />
          </div>
        </div>
      )}
    </>
  )
}
