'use client'
import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useApi } from '@/lib/client'
import { byCategory, monthly, toCsv, totals, yearsOf } from '@/lib/cashflow'
import { money, moneyWhole, signedMoney } from '@/lib/format'
import { MoneyTooltip } from '../components/charts'
import { DownloadIcon } from '../components/icons'
import StatCard from '../components/StatCard'
import { ErrorNote, PageTitle, Segmented, Skeleton } from '../components/ui'

const PALETTE = ['#7c4dff', '#b392ff', '#2ee59d', '#ff6b86', '#f5b84b', '#5ec8ff', '#dccdff']

function CategoryDonut({ title, rows }) {
  const total = rows.reduce((a, r) => a + r.value, 0)
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No data for this period.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="h-[190px] w-[190px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="var(--surface)" isAnimationActive={false}>
                  {rows.map((r, i) => (
                    <Cell key={r.name} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<MoneyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full flex-1 divide-y divide-line text-sm">
            {rows.map((r, i) => (
              <li key={r.name} className="flex items-center gap-3 py-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="flex-1 font-medium">{r.name}</span>
                <span className="w-11 text-right text-muted">{Math.round((r.value / total) * 100)}%</span>
                <span className="w-24 text-right font-semibold">{money(r.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default function ReportsPage() {
  const { data: tx, error, loading, reload } = useApi('/api/transactions')
  const [year, setYear] = useState('All')

  const years = useMemo(() => yearsOf(tx || []), [tx])
  const scoped = useMemo(() => (year === 'All' ? tx || [] : (tx || []).filter((t) => t.date.startsWith(year))), [tx, year])
  const t = useMemo(() => totals(scoped), [scoped])
  const months = useMemo(() => monthly(scoped).slice().reverse(), [scoped])

  const exportCsv = () => {
    const blob = new Blob([toCsv(scoped)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${year.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) return <ErrorNote onRetry={reload}>Could not load transactions. {error.message}</ErrorNote>

  return (
    <>
      <PageTitle
        title="Reports"
        subtitle="Detailed financial reports and analytics"
        actions={
          <div className="flex max-w-full flex-wrap items-center gap-3">
            {years.length > 0 && <Segmented label="Year" options={['All', ...years]} value={year} onChange={setYear} />}
            <button className="btn btn-ghost" onClick={exportCsv} disabled={!scoped.length}>
              <DownloadIcon size={17} /> Export CSV
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Income" value={moneyWhole(t.income)} tone="text-gain" icon="▲" />
            <StatCard label="Total Expense" value={moneyWhole(t.expense)} tone="text-loss" icon="▼" />
            <StatCard label="Balance" value={moneyWhole(t.balance)} tone={t.balance >= 0 ? 'text-ink' : 'text-loss'} icon="◍" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CategoryDonut title="Expenses by category" rows={byCategory(scoped, 'expense')} />
            <CategoryDonut title="Income by source" rows={byCategory(scoped, 'income')} />
          </div>

          <section className="card overflow-hidden">
            <h2 className="px-5 pb-3 pt-5 text-lg font-bold sm:px-6">Monthly summary</h2>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-y border-line text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold sm:px-6">Month</th>
                    <th className="px-3 py-3 text-right font-semibold">Income</th>
                    <th className="px-3 py-3 text-right font-semibold">Expense</th>
                    <th className="px-5 py-3 text-right font-semibold sm:px-6">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((m) => (
                    <tr key={m.key} className="border-b border-line last:border-0">
                      <td className="px-5 py-2.5 font-medium sm:px-6">{m.label}</td>
                      <td className="px-3 py-2.5 text-right text-gain">{m.income ? money(m.income) : '—'}</td>
                      <td className="px-3 py-2.5 text-right text-loss">{m.expense ? money(m.expense) : '—'}</td>
                      <td className={`px-5 py-2.5 text-right font-semibold sm:px-6 ${m.net >= 0 ? '' : 'text-loss'}`}>{signedMoney(m.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
