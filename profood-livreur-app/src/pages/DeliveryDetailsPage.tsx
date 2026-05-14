/**
 * DeliveryDetailsPage — full detail view for a single delivery.
 *
 * Reached from TourListPage (/livraison/:id). Uses useParams to read the
 * delivery id and useDeliveries to look up the record. Shows a graceful
 * "not found" state rather than crashing when the id is invalid.
 *
 * Layout (top → bottom):
 *   1. PageHeader with back button
 *   2. Customer card — avatar, name, phone, status, call CTA
 *   3. Address card
 *   4. Order meta — ref + scheduled time in a 2-col grid
 *   5. Items list
 *   6. Notes (conditional — amber bg, only when notes present)
 *   7. Amount card
 *   8. Action buttons (only when status is not delivered or issue)
 */

import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'
import { openDirections } from '../lib/navigation'

/** Format a number as French-locale FCFA currency (e.g. "25 000 FCFA"). */
function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

export function DeliveryDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { getDelivery } = useDeliveries()

  const delivery = id ? getDelivery(id) : undefined

  // Guard: render a minimal not-found state if the id resolves to nothing.
  if (!delivery) {
    return (
      <div className="min-h-dvh bg-background-light">
        <PageHeader title="Détails de la livraison" showBack />
        <div className="flex flex-col items-center justify-center gap-3 pt-24 px-4">
          <Icon name="search_off" size="xl" className="text-gray-300" />
          <p className="text-gray-500 font-semibold text-center">
            Livraison introuvable
          </p>
          <p className="text-sm text-gray-400 text-center">
            L'identifiant fourni ne correspond à aucune livraison connue.
          </p>
        </div>
      </div>
    )
  }

  // Action buttons are only relevant when a decision is still pending.
  const showActions = delivery.status !== 'delivered' && delivery.status !== 'issue'

  return (
    <div className="min-h-dvh bg-background-light pb-10">
      <PageHeader title="Détails de la livraison" showBack />

      <main className="px-4 pt-5 flex flex-col gap-4">

        {/* ── 2. Customer card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Avatar placeholder — uses Material Symbol icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="person" size="md" className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-base truncate">
                  {delivery.customer.name}
                </p>
                <StatusBadge status={delivery.status} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{delivery.customer.phone}</p>
            </div>

            {/* Call CTA — tel: link triggers native phone dialer */}
            <a
              href={`tel:${delivery.customer.phone}`}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
              aria-label={`Appeler ${delivery.customer.name}`}
            >
              <Icon name="call" size="sm" className="text-green-600" />
            </a>
          </div>
        </div>

        {/* ── 3. Address card ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
          <Icon name="location_on" size="md" className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{delivery.address.street}</p>
            <p className="text-xs text-gray-500 mt-0.5">{delivery.address.city}</p>
          </div>
          <button
            type="button"
            onClick={() => openDirections(delivery.address)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary/90 active:scale-95 transition"
            aria-label="Ouvrir l'itinéraire dans Maps"
          >
            <Icon name="directions" size="sm" />
            Itinéraire
          </button>
        </div>

        {/* ── 4. Order meta grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Référence
            </p>
            <p className="font-bold text-gray-900 text-sm">{delivery.orderRef}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Heure prévue
            </p>
            <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
              <Icon name="schedule" size="sm" className="text-primary" />
              {delivery.scheduledTime}
            </p>
          </div>
        </div>

        {/* ── 5. Items list ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Articles
          </h2>
          <ul className="flex flex-col gap-2.5">
            {delivery.items.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <Icon name="inventory_2" size="sm" className="text-primary flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.weight && (
                    <span className="text-xs text-gray-400">{item.weight}</span>
                  )}
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    ×{item.quantity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 6. Notes (conditional) ─────────────────────────────────────── */}
        {delivery.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Icon name="info" size="sm" className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                Notes
              </p>
              <p className="text-sm text-amber-800">{delivery.notes}</p>
            </div>
          </div>
        )}

        {/* ── 7. Amount card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500">Montant total</p>
          <p className="text-lg font-bold text-gray-900">{formatFCFA(delivery.amount)}</p>
        </div>

        {/* ── 8. Action buttons ──────────────────────────────────────────── */}
        {showActions && (
          <div className="flex flex-col gap-3 pt-2 pb-6">
            {/* Primary: confirm delivery */}
            <Link
              to={`/livraison/${delivery.id}/confirmation`}
              className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary/90 active:scale-[0.98] transition text-base"
            >
              <Icon name="check_circle" size="md" />
              Confirmer la livraison
            </Link>

            {/* Secondary: report issue — white bg with red text/border */}
            <Link
              to={`/livraison/${delivery.id}/signalement`}
              className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-300 font-bold py-4 rounded-xl hover:bg-red-50 active:scale-[0.98] transition text-base"
            >
              <Icon name="report_problem" size="md" />
              Signaler un problème
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
