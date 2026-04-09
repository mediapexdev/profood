/**
 * MapPage — Phase 2 placeholder for the interactive delivery map.
 *
 * A real map (Mapbox, Google Maps, Leaflet, etc.) will be integrated in a
 * future phase. For now the page shows:
 *   - A full-screen simulated map background (bg-slate-200)
 *   - A centered placeholder card explaining the feature is coming
 *   - An overlay header showing how many stops remain
 *   - A list of active deliveries that each link to their detail page
 *   - A bottom "Back to list" button
 *
 * The overlay pattern (header + bottom bar on top of the fake map) already
 * matches the layout that will be reused once a real tile layer is added.
 */

import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useDeliveries } from '../hooks/useDeliveries'

export function MapPage() {
  const { activeDeliveries } = useDeliveries()

  return (
    <div className="relative min-h-dvh bg-slate-200 flex flex-col">

      {/* ── Full-screen fake map background ─────────────────────────────── */}
      {/* The grid pattern gives a subtle visual suggestion of a map tile. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Header overlay ───────────────────────────────────────────────── */}
      <div
        className="relative z-10 px-4 w-full"
        style={{ paddingTop: 'calc(16px + var(--sai-top))' }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="route" size="md" className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">
              {activeDeliveries.length} arrêt{activeDeliveries.length !== 1 ? 's' : ''} restant{activeDeliveries.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500">Tournée en cours</p>
          </div>
        </div>
      </div>

      {/* ── Centered placeholder ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg text-center max-w-xs">
          <Icon name="map" size="xl" className="text-primary mb-3" />
          <p className="font-bold text-gray-900 text-base mb-1">
            Carte interactive
          </p>
          <p className="text-sm text-gray-500">Phase 2</p>
        </div>
      </div>

      {/* ── Active delivery list ─────────────────────────────────────────── */}
      {activeDeliveries.length > 0 && (
        <div className="relative z-10 px-4 pb-4  w-full">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 pt-3 pb-2">
              Livraisons actives
            </p>
            <ul className="divide-y divide-gray-100">
              {activeDeliveries.map((delivery) => (
                <li key={delivery.id}>
                  <Link
                    to={`/livraison/${delivery.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                  >
                    {/* Stop number circle */}
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
                    <Icon name="chevron_right" size="sm" className="text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Bottom "Back to list" button ─────────────────────────────────── */}
      <div
        className="relative z-10 px-4 w-full"
        style={{ paddingBottom: 'max(24px, var(--sai-bottom))' }}
      >
        <Link
          to="/tournee"
          className="flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-4 rounded-xl shadow-md hover:bg-gray-50 active:scale-[0.98] transition text-base border border-gray-200"
        >
          <Icon name="list" size="md" />
          Retour à la liste
        </Link>
      </div>
    </div>
  )
}
