/**
 * HistoryPage — past deliveries (delivered / cancelled) with honest aggregates.
 *
 * Layout (top → bottom):
 *   1. PageHeader with title
 *   2. Quick-stats grid (3 cols): delivered count, cancelled count, amount
 *      collected — all derived from the driver's actual completed deliveries,
 *      never fabricated week/month multipliers.
 *   3. Status filter (Toutes / Livrées / Problèmes)
 *   4. Completed-delivery list
 */

import { useMemo, useState } from 'react'
import type { DeliveryStatus } from '../types'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'

/** Format a number as French-locale FCFA currency string. */
function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

interface StatCellProps {
  label: string
  value: number | string
  icon: string
  className: string
}

/** A single cell in the 3-column quick-stats grid (no fabricated trends). */
function StatCell({ label, value, icon, className }: StatCellProps) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
      <div className="flex items-center justify-center mb-1">
        <Icon name={icon} size="sm" className={className} />
      </div>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mt-1 leading-tight">
        {label}
      </p>
    </div>
  )
}

type FilterId = 'all' | 'delivered' | 'issue'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'delivered', label: 'Livrées' },
  { id: 'issue', label: 'Problèmes' },
]

export function HistoryPage() {
  const { completedDeliveries, loading } = useDeliveries()
  const [filter, setFilter] = useState<FilterId>('all')

  const { deliveredCount, issueCount, collected } = useMemo(() => {
    const delivered = completedDeliveries.filter((d) => d.status === 'delivered')
    const issues = completedDeliveries.filter((d) => d.status === 'issue')
    return {
      deliveredCount: delivered.length,
      issueCount: issues.length,
      collected: delivered.reduce((sum, d) => sum + (d.amount || 0), 0),
    }
  }, [completedDeliveries])

  const visible = completedDeliveries.filter((d) =>
    filter === 'all' ? true : d.status === (filter as DeliveryStatus)
  )

  if (loading) {
    return (
      <div className="min-h-dvh bg-background-light pb-nav flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background-light pb-nav">
      <PageHeader title="Historique des Livraisons" />

      <main className="px-4 pt-5 flex flex-col gap-5">

        {/* ── Quick stats (real, derived from completed deliveries) ───────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCell
            label="Livrées"
            value={deliveredCount}
            icon="check_circle"
            className="text-green-500"
          />
          <StatCell
            label="Problèmes"
            value={issueCount}
            icon="warning"
            className="text-red-500"
          />
          <StatCell
            label="Encaissé"
            value={formatFCFA(collected)}
            icon="payments"
            className="text-primary"
          />
        </div>

        {/* ── Status filter ──────────────────────────────────────────────── */}
        <div className="flex bg-white rounded-xl shadow-sm p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-colors ${
                filter === f.id ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Delivery list ──────────────────────────────────────────────── */}
        <section aria-label="Liste des livraisons terminées">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Livraisons terminées
          </h2>

          {visible.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune livraison terminée.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((delivery) => {
                const borderClass =
                  delivery.status === 'delivered'
                    ? 'border-primary'
                    : 'border-slate-300'

                return (
                  <li key={delivery.id}>
                    <div
                      className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${borderClass}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Person avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="person" size="sm" className="text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Top row: name + status badge */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {delivery.customer.name}
                            </p>
                            <StatusBadge status={delivery.status} />
                          </div>

                          {/* Time + address */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Icon name="schedule" size="sm" className="flex-shrink-0" />
                            <span>{delivery.scheduledTime}</span>
                            <span className="text-gray-300">·</span>
                            <span className="truncate">
                              {[delivery.address.street, delivery.address.city].filter(Boolean).join(', ')}
                            </span>
                          </div>

                          {/* Amount */}
                          <p className="text-sm font-semibold text-gray-700">
                            {formatFCFA(delivery.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
