'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApi } from '@/lib/client'
import { money, qty, signedMoney, signedPct } from '@/lib/format'
import { useTheme, useWriteApi } from '../useContext/useContext'
import { CLASS_COLORS, Sparkline } from '../components/charts'
import { EditIcon, PlusIcon, TrashIcon } from '../components/icons'
import { Delta, EmptyState, ErrorNote, Modal, PageTitle, Skeleton } from '../components/ui'
import HoldingModal from '../components/HoldingModal'

function Holdings() {
  const { canWrite } = useTheme()
  const write = useWriteApi()
  const router = useRouter()
  const params = useSearchParams()
  const { data, error, loading, reload } = useApi('/api/holdings')

  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [delError, setDelError] = useState('')
  const [busy, setBusy] = useState(false)

  // header search button links here with ?add=1
  useEffect(() => {
    if (params.get('add') === '1' && canWrite) {
      setAdding(true)
      router.replace('/holdings')
    }
  }, [params, canWrite, router])

  const confirmDelete = async () => {
    setBusy(true)
    setDelError('')
    try {
      await write(`/api/holdings/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null)
      await reload()
    } catch (e) {
      setDelError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const holdings = data?.holdings || []

  return (
    <>
      <PageTitle
        title="Holdings"
        subtitle="Everything you own, priced with live market data."
        actions={
          canWrite && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              <PlusIcon size={18} /> Add holding
            </button>
          )
        }
      />

      {error && <ErrorNote onRetry={reload}>Could not load holdings. {error.message}</ErrorNote>}
      {loading && <Skeleton className="h-64 w-full" />}

      {data && holdings.length === 0 && (
        <div className="card">
          <EmptyState
            title="No holdings yet"
            text="Add your first stock, ETF, fund or cash balance to start tracking."
            action={
              canWrite ? (
                <button className="btn btn-primary" onClick={() => setAdding(true)}>
                  <PlusIcon size={18} /> Add holding
                </button>
              ) : (
                <p className="text-sm text-muted">Switch to Admin mode to add holdings.</p>
              )
            }
          />
        </div>
      )}

      {holdings.length > 0 && (
        <>
          {/* Table (tablet / desktop) */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-semibold">Asset</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Shares</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Avg cost</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Price</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Value</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Gain / loss</th>
                  <th className="px-3 py-3.5 text-right font-semibold">Today</th>
                  {canWrite && <th className="px-5 py-3.5 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-1.5 rounded-full" style={{ background: CLASS_COLORS[h.asset_class] }} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-bold">{h.symbol}</p>
                          <p className="max-w-[210px] truncate text-xs text-muted">
                            {h.name} · {h.asset_class}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right">{qty(h.shares)}</td>
                    <td className="px-3 py-3.5 text-right">{h.asset_class === 'Cash' ? '—' : money(h.avg_cost)}</td>
                    <td className="px-3 py-3.5 text-right">
                      {h.asset_class === 'Cash' ? '—' : money(h.price)}
                      {h.priceStatus === 'unavailable' && <span className="block text-[10px] text-loss">price unavailable</span>}
                    </td>
                    <td className="px-3 py-3.5 text-right font-bold">{money(h.value)}</td>
                    <td className={`px-3 py-3.5 text-right font-semibold ${h.gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {signedMoney(h.gain)}
                      <span className="block text-xs">{signedPct(h.gainPct)}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      {h.dayChangePct != null && h.asset_class !== 'Cash' ? <Delta value={h.dayChangePct} className="!text-xs" /> : '—'}
                    </td>
                    {canWrite && (
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-ghost !p-2" onClick={() => setEditing(h)} aria-label={`Edit ${h.symbol}`}>
                            <EditIcon size={16} />
                          </button>
                          <button className="btn btn-danger !p-2" onClick={() => setDeleting(h)} aria-label={`Delete ${h.symbol}`}>
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

          {/* Cards (mobile) */}
          <ul className="space-y-3 md:hidden">
            {holdings.map((h) => (
              <li key={h.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{h.symbol}</p>
                    <p className="truncate text-xs text-muted">
                      {h.name} · {h.asset_class}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold">{money(h.value)}</p>
                    <p className={`text-xs font-semibold ${h.gain >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {signedMoney(h.gain)} ({signedPct(h.gainPct)})
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
                  <span>
                    {qty(h.shares)} {h.asset_class === 'Cash' ? '' : `× ${money(h.price)}`}
                  </span>
                  <Sparkline data={h.spark} up={(h.dayChangePct ?? 0) >= 0} width={70} height={24} />
                </div>
                {canWrite && (
                  <div className="mt-3 flex gap-2">
                    <button className="btn btn-ghost flex-1 !py-2" onClick={() => setEditing(h)}>
                      <EditIcon size={15} /> Edit
                    </button>
                    <button className="btn btn-danger flex-1 !py-2" onClick={() => setDeleting(h)}>
                      <TrashIcon size={15} /> Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {adding && <HoldingModal onClose={() => setAdding(false)} onSaved={reload} />}
      {editing && <HoldingModal holding={editing} onClose={() => setEditing(null)} onSaved={reload} />}
      {deleting && (
        <Modal title="Delete holding?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted">
            Remove <span className="font-bold text-ink">{deleting.symbol}</span> from your portfolio? This cannot be undone.
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

export default function HoldingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <Holdings />
    </Suspense>
  )
}
