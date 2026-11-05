'use client'
import { useMemo, useState } from 'react'
import { useApi } from '@/lib/client'
import { money, prettyDate } from '@/lib/format'
import { useTheme, useWriteApi } from '../useContext/useContext'
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from '../components/icons'
import { EmptyState, ErrorNote, Field, Modal, PageTitle, Skeleton } from '../components/ui'

const PAGE = 25
const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({ category: '', amount: '', date: today(), type: 'expense' })

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${
        type === 'income' ? 'bg-[var(--gain-bg)] text-gain' : 'bg-[var(--loss-bg)] text-loss'
      }`}
    >
      {type}
    </span>
  )
}

function TransactionModal({ initial, onClose, onSaved }) {
  const write = useWriteApi()
  const editing = Boolean(initial?.id)
  const [form, setForm] = useState(initial ? { ...initial, amount: String(initial.amount) } : blank())
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setErrors({})
    try {
      const body = { category: form.category, amount: Number(form.amount), date: form.date, type: form.type }
      if (editing) await write(`/api/transactions/${initial.id}`, { method: 'PUT', body })
      else await write('/api/transactions', { method: 'POST', body })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
      setErrors(err.errors || {})
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit transaction' : 'Add transaction'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Type" error={errors.type}>
          <select className="field" value={form.type} onChange={set('type')}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </Field>
        <Field label="Category" error={errors.category}>
          <input className="field" value={form.category} onChange={set('category')} maxLength={60} placeholder="e.g. Salary, Food" required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount ($)" error={errors.amount}>
            <input className="field" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.amount} onChange={set('amount')} required />
          </Field>
          <Field label="Date" error={errors.date}>
            <input className="field" type="date" value={form.date} onChange={set('date')} required />
          </Field>
        </div>
        {error && !Object.keys(errors).length && (
          <p role="alert" className="rounded-xl bg-[var(--loss-bg)] px-3.5 py-2.5 text-sm text-loss">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1" disabled={busy}>
            {busy ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function TransactionsPage() {
  const { canWrite } = useTheme()
  const write = useWriteApi()
  const { data, error, loading, reload } = useApi('/api/transactions')

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [modal, setModal] = useState(null) // null | {initial?}
  const [deleting, setDeleting] = useState(null)
  const [delError, setDelError] = useState('')
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data || []).filter((t) => (!type || t.type === type) && (!q || t.category.toLowerCase().includes(q)))
  }, [data, search, type])

  const confirmDelete = async () => {
    setBusy(true)
    setDelError('')
    try {
      await write(`/api/transactions/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null)
      await reload()
    } catch (e) {
      setDelError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const shown = filtered.slice(0, limit)

  return (
    <>
      <PageTitle
        title="Transactions"
        subtitle="Manage your income and expenses"
        actions={
          canWrite && (
            <button className="btn btn-primary" onClick={() => setModal({})}>
              <PlusIcon size={18} /> Add transaction
            </button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <SearchIcon size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="field pl-10"
            placeholder="Search by category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setLimit(PAGE)
            }}
            aria-label="Search by category"
          />
        </div>
        <select
          className="field"
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setLimit(PAGE)
          }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {error && <ErrorNote onRetry={reload}>Could not load transactions. {error.message}</ErrorNote>}
      {loading && <Skeleton className="h-72 w-full" />}

      {data && filtered.length === 0 && (
        <div className="card">
          <EmptyState title="No transactions found" text={data.length ? 'Try a different search or filter.' : 'Add your first transaction to get started.'} />
        </div>
      )}

      {shown.length > 0 && (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-3 py-3.5 font-semibold">Category</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Amount</th>
                  <th className="px-3 py-3.5 font-semibold">Type</th>
                  {canWrite && <th className="px-5 py-3.5 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface2/50">
                    <td className="px-5 py-3">{prettyDate(t.date)}</td>
                    <td className="px-3 py-3 font-medium">{t.category}</td>
                    <td className={`px-3 py-3 text-right font-bold ${t.type === 'income' ? 'text-gain' : ''}`}>
                      {t.type === 'income' ? '+' : '−'}
                      {money(t.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <TypeBadge type={t.type} />
                    </td>
                    {canWrite && (
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-ghost !p-2" onClick={() => setModal({ initial: t })} aria-label={`Edit ${t.category} on ${t.date}`}>
                            <EditIcon size={16} />
                          </button>
                          <button className="btn btn-danger !p-2" onClick={() => setDeleting(t)} aria-label={`Delete ${t.category} on ${t.date}`}>
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {shown.map((t) => (
              <li key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{t.category}</p>
                    <p className="text-xs text-muted">{prettyDate(t.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold ${t.type === 'income' ? 'text-gain' : ''}`}>
                      {t.type === 'income' ? '+' : '−'}
                      {money(t.amount)}
                    </p>
                    <TypeBadge type={t.type} />
                  </div>
                </div>
                {canWrite && (
                  <div className="mt-3 flex gap-2">
                    <button className="btn btn-ghost flex-1 !py-2" onClick={() => setModal({ initial: t })}>
                      <EditIcon size={15} /> Edit
                    </button>
                    <button className="btn btn-danger flex-1 !py-2" onClick={() => setDeleting(t)}>
                      <TrashIcon size={15} /> Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>
              Showing {shown.length} of {filtered.length}
            </span>
            {filtered.length > shown.length && (
              <button className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
                Show more
              </button>
            )}
          </div>
        </>
      )}

      {modal && <TransactionModal initial={modal.initial} onClose={() => setModal(null)} onSaved={reload} />}
      {deleting && (
        <Modal title="Delete transaction?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted">
            Delete <span className="font-bold text-ink">{deleting.category}</span> ({money(deleting.amount)} on {prettyDate(deleting.date)})? This cannot be undone.
          </p>
          {delError && <p className="mt-3 text-sm text-loss">{delError}</p>}
          <div className="mt-5 flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="btn flex-1 bg-loss text-white" onClick={confirmDelete} disabled={busy}>
              {busy ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
