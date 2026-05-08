/**
 * HistoryPage — view past deliveries with aggregate statistics.
 *
 * Layout (top → bottom):
 *   1. PageHeader with title
 *   2. Quick-stats grid (3 cols): today / week / month counts with trend icons
 *   3. Full delivery list — border-l-4 primary for delivered, slate for others
 *
 * The stats shown are derived from the mock data; in production they would
 * come from a dedicated statistics endpoint that aggregates by time window.
 */

import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'
import { useStats } from '../hooks/useStats'

/** Format a number as French-locale FCFA currency string. */
function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

interface StatCellProps {
  label: string
  value: number | string
  trend: 'up' | 'down' | 'neutral'
}

/**
 * A single cell in the 3-column quick-stats grid.
 * Trend icons provide an at-a-glance performance indicator.
 */
function StatCell({ label, value, trend }: StatCellProps) {
  const trendConfig = {
    up: { icon: 'trending_up', className: 'text-green-500' },
    down: { icon: 'trending_down', className: 'text-red-500' },
    neutral: { icon: 'trending_flat', className: 'text-gray-400' },
  }[trend]

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon name={trendConfig.icon} size="sm" className={trendConfig.className} />
      </div>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mt-1 leading-tight">
        {label}
      </p>
    </div>
  )
}

export function HistoryPage() {
  const { deliveries, loading } = useDeliveries()
  const { stats } = useStats()

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

      <main className="px-4 pt-5  flex flex-col gap-5">

        {/* ── Quick stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCell
            label="Aujourd'hui"
            value={stats.deliveriesCompleted}
            trend="up"
          />
          <StatCell
            label="Semaine"
            value={stats.deliveriesTotal}
            trend="up"
          />
          <StatCell
            label="Ce mois"
            value={stats.deliveriesTotal * 4}
            trend="neutral"
          />
        </div>

        {/* ── Delivery list ──────────────────────────────────────────────── */}
        <section aria-label="Liste des livraisons">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Toutes les livraisons
          </h2>

          {deliveries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune livraison enregistrée.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {deliveries.map((delivery) => {
                // Delivered orders use the brand primary accent; all others
                // use a neutral slate border to indicate incomplete state.
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
                              {delivery.address.street}, {delivery.address.city}
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
