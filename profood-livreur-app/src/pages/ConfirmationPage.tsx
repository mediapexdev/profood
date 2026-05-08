/**
 * ConfirmationPage — collects proof of delivery before marking an order done.
 *
 * Reached from DeliveryDetailsPage via /livraison/:id/confirmation.
 * The driver can:
 *   - Toggle between "Livraison complète" and "Livraison partielle"
 *   - Attach photo proof (placeholder squares — camera integration Phase 2)
 *   - Sign digitally (placeholder pad — canvas integration Phase 2)
 *   - Review and tick each item in the order
 *   - Submit → calls updateStatus(id, 'delivered') then navigates to /
 *
 * If the delivery id cannot be resolved we show a "not found" state identical
 * to DeliveryDetailsPage to keep the UX consistent.
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDeliveries } from '../hooks/useDeliveries'

// Number of photo proof slots to render.
const PHOTO_SLOT_COUNT = 3

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDelivery, updateStatus } = useDeliveries()

  const delivery = id ? getDelivery(id) : undefined

  // "complete" vs "partial" toggle state.
  const [isComplete, setIsComplete] = useState(true)

  // Track which items are checked — default all checked for complete delivery.
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    () => (delivery?.items ?? []).map(() => true)
  )

  if (!delivery) {
    return (
      <div className="min-h-dvh bg-background-light">
        <PageHeader title="Confirmation de Livraison" showBack />
        <div className="flex flex-col items-center justify-center gap-3 pt-24 px-4">
          <Icon name="search_off" size="xl" className="text-gray-300" />
          <p className="text-gray-500 font-semibold text-center">
            Livraison introuvable
          </p>
        </div>
      </div>
    )
  }

  /** Toggle the checked state for a single item by its index. */
  const toggleItem = (index: number) => {
    setCheckedItems((prev) =>
      prev.map((checked, i) => (i === index ? !checked : checked))
    )
  }

  /**
   * Flip between complete / partial mode.
   * When switching to complete, re-check every item automatically.
   * When switching to partial, leave current checks untouched so the driver
   * can de-select items one by one.
   */
  const handleToggleMode = (complete: boolean) => {
    setIsComplete(complete)
    if (complete) {
      setCheckedItems((prev) => prev.map(() => true))
    }
  }

  /** Persist status change (API + local) then return to the dashboard. */
  const handleConfirm = async () => {
    await updateStatus(delivery.id, 'delivered')
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-background-light pb-10">
      <PageHeader title="Confirmation de Livraison" showBack />

      <main className="px-4 pt-5  flex flex-col gap-5">

        {/* ── Toggle: complete / partial ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              isComplete
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Livraison complète
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              !isComplete
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Livraison partielle
          </button>
        </div>

        {/* ── Photo proof ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Preuve photo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: PHOTO_SLOT_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary/50 hover:text-primary/60 transition-colors"
                aria-label="Ajouter une photo"
              >
                <Icon name="add_a_photo" size="md" />
                <span className="text-[10px] font-semibold">Photo</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Signature pad placeholder ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Signature client
            </h2>
            <button
              type="button"
              className="text-gray-400 hover:text-primary transition-colors"
              aria-label="Effacer la signature"
            >
              <Icon name="refresh" size="sm" />
            </button>
          </div>
          {/* Canvas will replace this placeholder in Phase 2 */}
          <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400">
            <Icon name="draw" size="lg" />
            <span className="text-xs font-semibold">Signez ici</span>
          </div>
        </div>

        {/* ── Item checklist ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Articles livrés
          </h2>
          <ul className="flex flex-col gap-3">
            {delivery.items.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    checkedItems[index]
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 bg-white'
                  }`}
                  aria-checked={checkedItems[index]}
                  role="checkbox"
                  aria-label={item.name}
                >
                  {checkedItems[index] && (
                    <Icon name="check" size="sm" className="text-white" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm font-medium transition-colors ${
                    checkedItems[index] ? 'text-gray-800' : 'text-gray-400 line-through'
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {item.weight ? `${item.weight} × ` : ''}{item.quantity}x
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Confirm button ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => void handleConfirm()}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 active:scale-[0.98] transition text-base"
        >
          <Icon name="check_circle" size="md" />
          Confirmer la livraison
        </button>
      </main>
    </div>
  )
}
