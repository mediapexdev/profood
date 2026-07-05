/**
 * ConfirmationPage — captures proof of delivery, then marks the order done.
 *
 * Reached from DeliveryDetailsPage via /livraison/:id/confirmation.
 * The driver can:
 *   - Toggle between "Livraison complète" and "Livraison partielle"
 *   - Attach photo proof (device camera / gallery, downscaled client-side)
 *   - Review and tick each item actually handed over
 *   - Add a note (useful for a partial delivery)
 *   - Submit → POST /livreur-confirm-delivery (persists proof + marks delivered)
 *
 * Proof is optional: the driver can always confirm. Partial deliveries are
 * record-only — the checklist + note are stored for the manager to reconcile.
 */

import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDeliveries } from '../hooks/useDeliveries'
import { confirmDelivery } from '../api/orders'
import { fileToDownscaledDataUrl } from '../lib/image'
import { openDirections } from '../lib/navigation'

// Maximum number of proof photos.
const MAX_PHOTOS = 3

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDelivery, updateStatus, refresh, activeDeliveries } = useDeliveries()

  const delivery = id ? getDelivery(id) : undefined

  // "complete" vs "partial" toggle state.
  const [isComplete, setIsComplete] = useState(true)

  // Track which items are checked — default all checked for complete delivery.
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    () => (delivery?.items ?? []).map(() => true)
  )

  const [photos, setPhotos] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  /** Capture one or more photos, downscaled client-side, capped at MAX_PHOTOS. */
  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const remaining = MAX_PHOTOS - photos.length
    const picked = Array.from(files).slice(0, remaining)
    try {
      const urls = await Promise.all(picked.map((f) => fileToDownscaledDataUrl(f)))
      setPhotos((prev) => [...prev, ...urls].slice(0, MAX_PHOTOS))
    } catch {
      setError("Impossible de traiter la photo. Réessayez.")
    } finally {
      // Reset so picking the same file again still fires onChange.
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Persist proof + delivered status, then surface the "next stop" prompt.
  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await confirmDelivery({
        orderId: delivery.id,
        isComplete,
        note,
        items: delivery.items.map((item, i) => ({
          name: item.name,
          quantity: item.quantity,
          delivered: checkedItems[i] ?? true,
        })),
        photos,
      })
      // Keep the local list in sync so activeDeliveries drops this stop.
      void refresh()
      setConfirmed(true)
    } catch {
      setError("La confirmation a échoué. Vérifiez votre connexion et réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  // After confirmation, activeDeliveries still holds this stop until the
  // refetch lands, so exclude it explicitly to find the real next stop.
  const nextStop = confirmed
    ? activeDeliveries.find((d) => d.id !== delivery.id)
    : undefined

  const handleNavigateNext = () => {
    if (!nextStop) return
    if (nextStop.status !== 'in_progress') {
      void updateStatus(nextStop.id, 'in_progress')
    }
    openDirections(nextStop.address)
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            Preuve photo
          </h2>
          <p className="text-[11px] text-gray-400 mb-3">Optionnel — recommandé en cas de litige.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoPick}
          />
          <div className="grid grid-cols-3 gap-3">
            {photos.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                <img src={src} alt={`Preuve ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="Retirer la photo"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary/50 hover:text-primary/60 transition-colors"
                aria-label="Ajouter une photo"
              >
                <Icon name="add_a_photo" size="md" />
                <span className="text-[10px] font-semibold">Photo</span>
              </button>
            )}
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

        {/* ── Note (especially for a partial delivery) ───────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Note {isComplete ? '(optionnel)' : '(recommandé)'}
          </h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={isComplete ? 'Remarque éventuelle…' : 'Précisez ce qui n’a pas été livré et pourquoi…'}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800 focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
            <Icon name="error" size="sm" className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Confirm button ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={submitting || confirmed}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 active:scale-[0.98] transition text-base disabled:opacity-60 disabled:active:scale-100"
        >
          <Icon name="check_circle" size="md" />
          {submitting ? 'Confirmation…' : 'Confirmer la livraison'}
        </button>
      </main>

      {/* ── Post-confirm prompt: next stop or done ──────────────────────── */}
      {confirmed && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon name="check_circle" size="md" className="text-green-600" />
              </span>
              <div>
                <p className="font-bold text-gray-900 text-base leading-tight">
                  Livraison confirmée
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {delivery.customer.name} — {delivery.orderRef}
                </p>
              </div>
            </div>

            {nextStop ? (
              <>
                <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {nextStop.stopNumber ?? '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Prochain arrêt
                    </p>
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {nextStop.customer.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {nextStop.address.street}
                      {nextStop.address.city ? `, ${nextStop.address.city}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNavigateNext}
                  className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.98] transition"
                >
                  <Icon name="directions" size="md" />
                  Lancer l'itinéraire
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/tournee/carte')}
                    className="flex items-center justify-center gap-1.5 bg-white text-gray-700 border border-gray-200 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50"
                  >
                    <Icon name="map" size="sm" />
                    Voir la liste
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-1.5 bg-white text-gray-700 border border-gray-200 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50"
                  >
                    <Icon name="home" size="sm" />
                    Tableau de bord
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="font-semibold text-green-800 text-sm">
                    Toutes vos livraisons sont à jour.
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Bonne fin de journée !
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.98] transition"
                >
                  <Icon name="home" size="md" />
                  Retour au tableau de bord
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
