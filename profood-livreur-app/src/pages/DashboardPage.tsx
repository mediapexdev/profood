/**
 * DashboardPage — the home screen displayed after successful login.
 *
 * Layout (top → bottom):
 *   1. Sticky greeting header with notification bell
 *   2. Hero card — today's total deliveries with grouped/individual breakdown
 *   3. CTA button — starts the tour
 *   4. 2×2 status grid — live counts per delivery state
 *   5. Route info card — total distance & estimated average time
 *   6. Next deliveries — first 3 active deliveries linking to detail pages
 *
 * Data comes exclusively from custom hooks so the component stays thin and
 * testable. No side-effects are performed here.
 */

import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../contexts/AuthContext'
import { useDeliveries } from '../hooks/useDeliveries'
import { useStats } from '../hooks/useStats'
import { useNotifications } from '../hooks/useNotifications'
import { openDirections } from '../lib/navigation'

// ── Small presentational sub-components ──────────────────────────────────────

interface StatusCardProps {
  label: string
  count: number
  icon: string
  /** Tailwind bg + text colour utilities */
  colorClasses: string
}

/**
 * A single cell in the 2×2 status grid.
 * Kept small and focused to make the grid section easy to read.
 */
function StatusCard({ label, count, icon, colorClasses }: StatusCardProps) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-2 ${colorClasses}`}>
      <Icon name={icon} filled size="md" />
      <span className="text-2xl font-bold leading-none">{count}</span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { driver } = useAuth()
  const {
    activeDeliveries,
    loading: deliveriesLoading,
    updateStatus,
  } = useDeliveries()
  const { stats, loading: statsLoading } = useStats()
  const { unreadCount } = useNotifications()

  // Démarrer la tournée: mark the first stop in-progress (if it isn't
  // already) then hand off to native Maps. The sort in useDeliveries
  // ensures activeDeliveries[0] is the closest pending stop, or any
  // already in-progress stop the livreur hasn't confirmed yet.
  const handleStartTour = async () => {
    const next = activeDeliveries[0]
    if (!next) return
    if (next.status !== 'in_progress') {
      try {
        await updateStatus(next.id, 'in_progress')
      } catch {
        // updateStatus already surfaces an error toast via the hook;
        // we still launch Maps so the driver can start driving.
      }
    }
    openDirections(next.address)
  }

  // Show a simple loading indicator while the first fetch is in progress.
  const isLoading = deliveriesLoading || statsLoading

  // Display only the driver's first name to keep the greeting concise.
  const firstName = driver?.name.split(' ')[0] ?? 'Livreur'

  // The 3 next deliveries to show in the preview list.
  const nextDeliveries = activeDeliveries.slice(0, 3)

  // During the initial load we show a minimal skeleton so the driver knows
  // data is being fetched rather than seeing a broken empty screen.
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background-light pb-nav flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background-light pb-nav">

      {/* ── 1. Sticky greeting header ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary/10"
        style={{ paddingTop: 'var(--sai-top)' }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Bonjour,
            </p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{firstName}</h1>
          </div>

          {/* Notification bell — badge shows unread count when > 0 */}
          <Link
            to="/notifications"
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/5 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
          >
            <Icon name="notifications" size="md" className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
          </Link>
        </div>
      </header>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <main className="px-4 pt-5 flex flex-col gap-5">

        {/* ── 2. Hero card ─────────────────────────────────────────────── */}
        <div className="bg-primary rounded-2xl p-5 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
            Aujourd'hui
          </p>
          <p className="text-5xl font-bold leading-none mb-1">
            {stats.deliveriesTotal}
          </p>
          <p className="text-sm font-semibold opacity-90 mb-4">Livraisons</p>

          {/* Grouped / Individual breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">{stats.deliveriesGrouped}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80 mt-0.5">
                Groupées
              </p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-2xl font-bold">{stats.deliveriesIndividual}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80 mt-0.5">
                Individuelles
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. CTA button ────────────────────────────────────────────── */}
        {activeDeliveries.length > 0 ? (
          <button
            type="button"
            onClick={() => void handleStartTour()}
            className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary/90 active:scale-[0.98] transition text-base"
          >
            <Icon name="play_arrow" filled size="md" className="text-white" />
            Démarrer la tournée
          </button>
        ) : (
          <Link
            to="/tournee"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-500 font-bold py-4 rounded-xl text-base"
          >
            <Icon name="inbox" size="md" />
            Aucune livraison à démarrer
          </Link>
        )}

        {/* ── 4. Status grid (2×2) ──────────────────────────────────────── */}
        <section aria-label="Statuts des livraisons">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Statuts
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              label="En attente"
              count={stats.deliveriesPending}
              icon="schedule"
              colorClasses="bg-amber-50 text-amber-700"
            />
            <StatusCard
              label="En cours"
              count={stats.deliveriesInProgress}
              icon="local_shipping"
              colorClasses="bg-green-50 text-green-700"
            />
            <StatusCard
              label="Livrées"
              count={stats.deliveriesCompleted}
              icon="check_circle"
              colorClasses="bg-blue-50 text-blue-700"
            />
            <StatusCard
              label="Problèmes"
              count={stats.deliveriesWithIssues}
              icon="warning"
              colorClasses="bg-red-50 text-red-700"
            />
          </div>
        </section>

        {/* ── 5. Route info card ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-around">
          <div className="flex flex-col items-center gap-1">
            <Icon name="route" size="md" className="text-primary" />
            <span className="text-lg font-bold text-gray-900">{stats.totalDistance}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Distance
            </span>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex flex-col items-center gap-1">
            <Icon name="timer" size="md" className="text-primary" />
            <span className="text-lg font-bold text-gray-900">{stats.averageTime}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Temps moy.
            </span>
          </div>
        </div>

        {/* ── 6. Next deliveries list ──────────────────────────────────── */}
        <section aria-label="Prochaines livraisons">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Prochaines livraisons
            </h2>
            <Link
              to="/tournee"
              className="text-xs font-bold text-primary hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {nextDeliveries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune livraison active pour le moment.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {nextDeliveries.map((delivery) => (
                <li key={delivery.id}>
                  <Link
                    to={`/livraison/${delivery.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Stop number + customer name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {delivery.stopNumber !== undefined && (
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {delivery.stopNumber}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {delivery.customer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {delivery.address.street}, {delivery.address.city}
                          </p>
                        </div>
                      </div>

                      {/* Status badge + scheduled time */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={delivery.status} />
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-0.5">
                          <Icon name="schedule" size="sm" />
                          {delivery.scheduledTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
