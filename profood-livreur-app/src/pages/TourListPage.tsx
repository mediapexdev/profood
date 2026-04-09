/**
 * TourListPage — ordered list of all stops in the driver's current tour.
 *
 * The page is intentionally simple: stops are sorted by stopNumber so the
 * driver always sees them in the correct sequence. A vertical connector line
 * between cards gives a visual "timeline" metaphor that maps naturally to
 * an ordered route.
 *
 * Layout (top → bottom):
 *   1. PageHeader with sync action
 *   2. Distance badge + "view on map" button
 *   3. Section heading with stop count
 *   4. Delivery cards connected by vertical line, each linking to /livraison/:id
 */

import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'

export function TourListPage() {
  const { deliveries } = useDeliveries()

  // Sort all deliveries by stopNumber ascending. Deliveries without a
  // stopNumber fall to the end of the list.
  const sortedDeliveries = [...deliveries].sort((a, b) => {
    const aStop = a.stopNumber ?? Infinity
    const bStop = b.stopNumber ?? Infinity
    return aStop - bStop
  })

  return (
    <div className="min-h-dvh bg-background-light pb-nav">
      <PageHeader
        title="Ma Tournée"
        rightAction={
          <button
            type="button"
            className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
            aria-label="Synchroniser"
          >
            <Icon name="sync" size="md" />
          </button>
        }
      />

      <main className="px-4 pt-5 flex flex-col gap-5">

        {/* ── Distance badge + map link ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          {/* Distance indicator pill */}
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl font-semibold text-sm">
            <Icon name="route" size="sm" />
            <span>12.4 km restants</span>
          </div>

          {/* Map link */}
          <Link
            to="/tournee/carte"
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="map" size="sm" />
            Voir sur la carte
          </Link>
        </div>

        {/* ── Stop list section ──────────────────────────────────────────── */}
        <section aria-label="Arrêts ordonnés">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Arrêts ordonnés
            </h2>
            {/* Count badge */}
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {sortedDeliveries.length}
            </span>
          </div>

          {sortedDeliveries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune livraison dans votre tournée.
            </p>
          ) : (
            <ul className="flex flex-col">
              {sortedDeliveries.map((delivery, index) => {
                const isLast = index === sortedDeliveries.length - 1
                // Only show first 2 item names to keep the card compact.
                const previewItems = delivery.items.slice(0, 2)

                return (
                  <li key={delivery.id} className="relative flex gap-3">

                    {/* ── Vertical connector line ────────────────────────── */}
                    {/* The line connects this card to the next one. It is
                        absolutely positioned relative to the li and drawn
                        below the stop-number circle. */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {/* Stop number circle */}
                      <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center z-10 flex-shrink-0 mt-4">
                        {delivery.stopNumber ?? index + 1}
                      </span>
                      {/* Connector line — hidden for the last item */}
                      {!isLast && (
                        <div className="w-0.5 flex-1 bg-primary/20 my-1" />
                      )}
                    </div>

                    {/* ── Card ───────────────────────────────────────────── */}
                    <div className="flex-1 mb-3">
                      <Link
                        to={`/livraison/${delivery.id}`}
                        className="block bg-white rounded-2xl p-4 shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow"
                      >
                        {/* Top row: customer name + status + time */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {delivery.customer.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {delivery.orderRef}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={delivery.status} />
                            <span className="text-xs font-semibold text-gray-400 flex items-center gap-0.5">
                              <Icon name="schedule" size="sm" />
                              {delivery.scheduledTime}
                            </span>
                          </div>
                        </div>

                        {/* Address row */}
                        <div className="flex items-start gap-1.5 mb-3">
                          <Icon name="location_on" size="sm" className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500">
                            {delivery.address.street}, {delivery.address.city}
                          </p>
                        </div>

                        {/* Item tags — first 2 items as pill badges */}
                        {previewItems.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {previewItems.map((item, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              >
                                {item.name}
                              </span>
                            ))}
                            {delivery.items.length > 2 && (
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                +{delivery.items.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
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
