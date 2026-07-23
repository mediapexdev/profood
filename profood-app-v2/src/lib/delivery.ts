/**
 * Livraison — double mode, comme l'auth et le catalogue.
 *
 *   • Mode API (commandes réelles) : localités Laravel (`get-localites-with-
 *     full-info`) + frais résolus par le serveur (`quote-delivery-fee`,
 *     public). Le montant serveur fait TOUJOURS foi (commune = zone,
 *     franco via `free_shipping_threshold`).
 *   • Mode local (démo) : table statique de 10 communes de Dakar, frais et
 *     franco calculés côté client — inchangé.
 */
import api from '../api/client'

// ── Mode local : table statique (démo) ────────────────────────────────────
export interface DeliveryZone {
  id: string
  commune: string
  fee: number
  /** Livraison offerte à partir de ce montant de panier (FCFA). */
  franco: number
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'plateau', commune: 'Dakar-Plateau', fee: 1500, franco: 40000 },
  { id: 'medina', commune: 'Médina', fee: 1500, franco: 40000 },
  { id: 'grand-dakar', commune: 'Grand Dakar', fee: 2000, franco: 45000 },
  { id: 'point-e', commune: 'Point E / Fann', fee: 2000, franco: 45000 },
  { id: 'ouakam', commune: 'Ouakam', fee: 2500, franco: 50000 },
  { id: 'ngor', commune: 'Ngor / Almadies', fee: 3000, franco: 50000 },
  { id: 'parcelles', commune: 'Parcelles Assainies', fee: 3000, franco: 55000 },
  { id: 'guediawaye', commune: 'Guédiawaye', fee: 3500, franco: 60000 },
  { id: 'pikine', commune: 'Pikine', fee: 3500, franco: 60000 },
  { id: 'rufisque', commune: 'Rufisque', fee: 4500, franco: 70000 },
]

export function zoneById(id: string | undefined): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id)
}

/** Frais applicables : 0 si le sous-total atteint le franco de la zone. */
export function deliveryFee(zone: DeliveryZone | undefined, subtotal: number): number {
  if (!zone) return 0
  return subtotal >= zone.franco ? 0 : zone.fee
}

// ── Mode API : localités + frais serveur ──────────────────────────────────
export interface Localite {
  id: number
  /** « Localité, Commune, Département » (format renvoyé par l'API). */
  wording: string
}

let localitesCache: Localite[] | null = null
let localitesPromise: Promise<Localite[]> | null = null

/**
 * Toutes les localités (≈1000), en marchant la pagination comme l'app Ionic.
 * Mise en cache mémoire : un seul chargement par session.
 */
export function fetchLocalites(): Promise<Localite[]> {
  if (localitesCache) return Promise.resolve(localitesCache)
  if (localitesPromise) return localitesPromise
  localitesPromise = (async () => {
    const all: Localite[] = []
    let page = 1
    let lastPage = 1
    do {
      const res = await api.get('/get-localites-with-full-info', { params: { per_page: 2000, page } })
      const rows: Localite[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      all.push(...rows)
      lastPage = Number(res.data?.last_page ?? 1)
      page += 1
      if (!rows.length) break
    } while (page <= lastPage)
    localitesCache = all
    return all
  })()
  localitesPromise.catch(() => { localitesPromise = null })
  return localitesPromise
}

const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Filtre tolérant accents/casse, pour l'autocomplete du checkout. */
export function filterLocalites(list: Localite[], query: string, max = 8): Localite[] {
  const q = strip(query.trim())
  if (!q) return []
  return list.filter((l) => strip(l.wording).includes(q)).slice(0, max)
}

export interface DeliveryQuote {
  fee: number
  freeShippingThreshold: number | null
  freeShippingApplied: boolean
}

/** Frais officiels pour une localité + sous-total (endpoint public). */
export async function quoteDeliveryFee(localiteId: number | null, subtotal: number): Promise<DeliveryQuote> {
  const res = await api.post('/quote-delivery-fee', { localite_id: localiteId, subtotal })
  return {
    fee: Number(res.data?.delivery_fee ?? 0),
    freeShippingThreshold: res.data?.free_shipping_threshold ?? null,
    freeShippingApplied: !!res.data?.free_shipping_applied,
  }
}
