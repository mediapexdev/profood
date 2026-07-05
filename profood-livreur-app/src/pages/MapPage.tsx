/**
 * MapPage — Navigation hub for the active tournée.
 *
 * No embedded map: we hand routing off to the OS's maps app (Apple Maps on
 * iOS, Google Maps on Android, google.com/maps on web). Drivers get real
 * turn-by-turn navigation instead of a pretty but inert tile view, and we
 * sidestep both Nominatim's rate limits and Mapbox's API key.
 *
 * Each active delivery exposes:
 *   - Stop number + customer + address
 *   - "Itinéraire" button → openDirections() deep-link
 *   - Tap on row → delivery details
 */

import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useDeliveries } from '../hooks/useDeliveries'
import { openDirections } from '../lib/navigation'

export function MapPage() {
  const { activeDeliveries } = useDeliveries()
  const nextStop = activeDeliveries[0]

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-4 pb-3"
        style={{ paddingTop: 'calc(16px + var(--sai-top))' }}
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="route" size="md" className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">
              {activeDeliveries.length} arrêt{activeDeliveries.length !== 1 ? 's' : ''} restant{activeDeliveries.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500">Tournée en cours</p>
          </div>
        </div>
      </div>

      {/* ── Next stop spotlight ─────────────────────────────────────────── */}
      {nextStop ? (
        <div className="px-4 pb-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Prochain arrêt
            </p>
            <div className="flex items-start gap-3 mb-4">
              <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {nextStop.stopNumber ?? '—'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {nextStop.customer.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {nextStop.address.street}
                </p>
                <p className="text-xs text-gray-500">
                  {nextStop.address.city}
                </p>
                {nextStop.distanceKm != null && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    À {nextStop.distanceKm.toFixed(1)} km
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => openDirections(nextStop.address)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.98] transition"
            >
              <Icon name="directions" size="md" />
              Itinéraire
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-xs">
            <Icon name="check_circle" size="xl" className="text-green-500 mb-3" />
            <p className="font-bold text-gray-900 text-base mb-1">
              Aucun arrêt en cours
            </p>
            <p className="text-sm text-gray-500">
              Toutes vos livraisons sont à jour.
            </p>
          </div>
        </div>
      )}

      {/* ── Remaining stops ─────────────────────────────────────────────── */}
      {activeDeliveries.length > 1 && (
        <div className="px-4 pb-3 flex-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 pt-3 pb-2">
              Arrêts suivants
            </p>
            <ul className="divide-y divide-gray-100">
              {activeDeliveries.slice(1).map((delivery) => (
                <li
                  key={delivery.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Link
                    to={`/livraison/${delivery.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {delivery.stopNumber ?? '—'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {delivery.customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {delivery.address.street}, {delivery.address.city}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openDirections(delivery.address)}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition"
                    aria-label={`Itinéraire vers ${delivery.customer.name}`}
                  >
                    <Icon name="directions" size="sm" className="text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Bottom: back to list ────────────────────────────────────────── */}
      <div
        className="px-4"
        style={{ paddingBottom: 'max(24px, var(--sai-bottom))' }}
      >
        <Link
          to="/tournee"
          className="flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-4 rounded-xl shadow-sm hover:bg-gray-50 active:scale-[0.98] transition text-base border border-gray-200"
        >
          <Icon name="list" size="md" />
          Retour à la liste
        </Link>
      </div>
    </div>
  )
}
