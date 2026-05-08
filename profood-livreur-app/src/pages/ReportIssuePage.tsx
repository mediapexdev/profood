/**
 * ReportIssuePage — lets the driver report a problem for a specific delivery.
 *
 * Reached from DeliveryDetailsPage via /livraison/:id/signalement.
 *
 * Layout (top → bottom):
 *   1. PageHeader with back button
 *   2. Order context card (orderRef + address summary on primary/5 bg)
 *   3. Radio button list for issue type selection
 *   4. Photo proof placeholder (Phase 2)
 *   5. Comment textarea
 *   6. Submit button → updateStatus(id, 'issue') → navigate to /
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDeliveries } from '../hooks/useDeliveries'

interface IssueType {
  id: string
  label: string
}

// Pre-defined issue categories aligned with what the manager app expects.
const ISSUE_TYPES: IssueType[] = [
  { id: 'absent', label: 'Client absent' },
  { id: 'address', label: 'Adresse introuvable' },
  { id: 'damaged', label: 'Produit endommagé' },
  { id: 'refused', label: 'Refus client' },
  { id: 'other', label: 'Autre' },
]

export function ReportIssuePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDelivery, updateStatus } = useDeliveries()

  const delivery = id ? getDelivery(id) : undefined

  const [selectedIssue, setSelectedIssue] = useState<string>(ISSUE_TYPES[0].id)
  const [comment, setComment] = useState('')

  if (!delivery) {
    return (
      <div className="min-h-dvh bg-background-light">
        <PageHeader title="Signaler un problème" showBack />
        <div className="flex flex-col items-center justify-center gap-3 pt-24 px-4">
          <Icon name="search_off" size="xl" className="text-gray-300" />
          <p className="text-gray-500 font-semibold text-center">
            Livraison introuvable
          </p>
        </div>
      </div>
    )
  }

  /** Mark the delivery as having an issue (API + local) then return to the dashboard. */
  const handleSubmit = async () => {
    await updateStatus(delivery.id, 'issue')
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-background-light pb-10">
      <PageHeader title="Signaler un problème" showBack />

      <main className="px-4 pt-5  flex flex-col gap-4">

        {/* ── Order context card ─────────────────────────────────────────── */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <Icon name="receipt" size="md" className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-900 text-sm">{delivery.orderRef}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {delivery.address.street}, {delivery.address.city}
            </p>
          </div>
        </div>

        {/* ── Issue type selection ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Type de problème
          </h2>
          <ul className="flex flex-col gap-2">
            {ISSUE_TYPES.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIssue(issue.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                    selectedIssue === issue.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Custom radio indicator */}
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedIssue === issue.id
                        ? 'border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIssue === issue.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      selectedIssue === issue.id ? 'text-primary font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {issue.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Photo proof placeholder ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Photo (optionnel)
          </h2>
          <button
            type="button"
            className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary/50 hover:text-primary/60 transition-colors"
            aria-label="Ajouter une photo"
          >
            <Icon name="add_a_photo" size="lg" />
            <span className="text-xs font-semibold">Ajouter une photo</span>
          </button>
        </div>

        {/* ── Comment textarea ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Commentaire
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez le problème rencontré…"
            className="w-full h-32 resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        {/* ── Submit button ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary/90 active:scale-[0.98] transition text-base"
        >
          <Icon name="send" size="md" />
          Envoyer le rapport
        </button>
      </main>
    </div>
  )
}
