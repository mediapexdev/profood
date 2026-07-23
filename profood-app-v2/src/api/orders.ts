/**
 * Commandes réelles via l'API Laravel — derrière le drapeau VITE_USE_API_ORDERS
 * (même philosophie de bascule progressive que le catalogue).
 *
 * Contrats (extraits du code serveur, cf. OrderController) :
 *   • Invité : POST /guest-order (à la livraison) et /guest-order-with-payment
 *     (PayTech). Public, throttle 10/min. Le serveur RECALCULE le montant depuis
 *     les prix en base et résout les frais depuis localite_id — nos totaux ne
 *     sont qu'indicatifs. /guest-order-with-payment renvoie directement la
 *     réponse PayTech {success, token, redirect_url} → simple redirection,
 *     pas besoin du script paytech.min.js.
 *   • Connecté : le serveur commande le PANIER SERVEUR courant → on le
 *     re-synchronise depuis le panier local juste avant (syncServerCart), puis
 *     POST /add-order-without-payment ou /add-order-with-payment.
 *
 * Les « box composées » v2 n'ont pas de box_type_id serveur : elles sont
 * décomposées en lignes de découpes (les IDs v2 === IDs API), et le total
 * affiché est la somme des prix réels — donc identique au recalcul serveur.
 */
import api from './client'
import type { CartLine } from '../contexts/CartContext'

export const ordersApiEnabled = import.meta.env.VITE_USE_API_ORDERS === 'true'

export class OrderApiError extends Error {}

function fail(error: unknown, fallback: string): never {
  const e = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
  const data = e?.response?.data
  const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
  throw new OrderApiError(data?.message || firstError || fallback)
}

/** `order_id` opaque pour les URLs de retour PayTech (équivalent v1). */
export async function makeOrderHash(): Promise<string> {
  const seed = `${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random()}`
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** « Awa Ndiaye Diop » → { first: 'Awa', last: 'Ndiaye Diop' }. */
export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: parts[0] }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

/** Numéro au format attendu par le serveur : 9 chiffres, sans indicatif. */
export const apiPhone = (v: string) => v.replace(/[^\d]/g, '').replace(/^221/, '')

interface ApiCartItem {
  type: 'slice'
  slice_id: number
  quantity: number
}

/**
 * Panier v2 → cart_items API. Les découpes passent telles quelles ; une box
 * composée devient ses découpes (qté = qté de box), agrégées par slice_id.
 */
export function toCartItems(lines: CartLine[]): ApiCartItem[] {
  const qtyBySlice = new Map<number, number>()
  const bump = (id: number, qty: number) => qtyBySlice.set(id, (qtyBySlice.get(id) ?? 0) + qty)
  for (const l of lines) {
    if (l.kind === 'slice') {
      const id = Number(l.id.replace('slice:', ''))
      if (Number.isFinite(id)) bump(id, l.qty)
    } else {
      for (const cutId of l.cutIds ?? []) bump(cutId, l.qty)
    }
  }
  return [...qtyBySlice.entries()].map(([slice_id, quantity]) => ({ type: 'slice', slice_id, quantity }))
}

export interface GuestOrderInput {
  name: string
  phone: string
  email?: string
  address: string
  localiteId: number | null
  lines: CartLine[]
}

function guestPayload(input: GuestOrderInput) {
  const { first, last } = splitName(input.name)
  return {
    guest_first_name: first,
    guest_last_name: last,
    guest_phone_number: apiPhone(input.phone),
    guest_email: input.email ?? '',
    address: input.address,
    ...(input.localiteId != null ? { localite_id: input.localiteId } : {}),
    cart_items: toCartItems(input.lines),
  }
}

export interface PlacedOrder {
  serverId: number
  serverRef: string
  montant: number
}

/** Commande invitée « à la livraison ». */
export async function placeGuestOrder(input: GuestOrderInput): Promise<PlacedOrder> {
  try {
    const res = await api.post('/guest-order', guestPayload(input))
    const o = res.data?.order ?? {}
    return { serverId: Number(o.id ?? 0), serverRef: String(o.string_id ?? ''), montant: Number(o.montant ?? 0) }
  } catch (e) {
    fail(e, 'Commande impossible pour le moment. Réessayez.')
  }
}

interface PayTechResponse {
  success?: number
  token?: string
  redirect_url?: string
  errors?: unknown[]
}

/** Commande invitée payée en ligne : renvoie l'URL de paiement PayTech. */
export async function placeGuestOrderWithPayment(input: GuestOrderInput, orderHash: string): Promise<string> {
  try {
    const res = await api.post('/guest-order-with-payment', { ...guestPayload(input), order_id: orderHash })
    const data = res.data as PayTechResponse
    if (data?.success === 1 && data.redirect_url) return data.redirect_url
    throw new OrderApiError('Le paiement en ligne est momentanément indisponible. Choisissez le paiement à la livraison.')
  } catch (e) {
    if (e instanceof OrderApiError) throw e
    fail(e, 'Le paiement en ligne est momentanément indisponible. Choisissez le paiement à la livraison.')
  }
}

// ── Parcours connecté (panier serveur) ────────────────────────────────────
const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } })

interface ServerCart {
  boxes: { id: number }[]
  slices: { id: number; slice?: { id: number }; quantity?: number }[]
}

async function readServerCart(token: string): Promise<ServerCart> {
  const res = await api.get('/get-cart', bearer(token))
  if (res.status !== 200) return { boxes: [], slices: [] }
  return { boxes: res.data?.boxes ?? [], slices: res.data?.slices ?? [] }
}

/**
 * Aligne le panier serveur sur le panier local : purge des lignes existantes
 * puis ré-ajout. Requis avant /add-order-* (le serveur commande SON panier).
 */
export async function syncServerCart(lines: CartLine[], customerId: number, token: string): Promise<void> {
  const cart = await readServerCart(token)
  for (const b of cart.boxes) {
    await api.post('/delete-box-from-cart', { id: b.id, customer_id: customerId }, bearer(token))
  }
  for (const s of cart.slices) {
    await api.post('/delete-slice-from-cart', { slice_id: s.slice?.id ?? s.id, customer_id: customerId }, bearer(token))
  }
  const items = toCartItems(lines)
  if (items.length) {
    await api.post(
      '/add-slices-to-cart',
      { customer_id: customerId, slices: items.map((i) => ({ id: i.slice_id, quantity: i.quantity })) },
      bearer(token),
    )
  }
}

/** Panier serveur → lignes fusionnables dans le panier local (au login). */
export async function fetchServerCartSlices(token: string): Promise<{ sliceId: number; qty: number }[]> {
  try {
    const cart = await readServerCart(token)
    return cart.slices
      .map((s) => ({ sliceId: Number(s.slice?.id ?? 0), qty: Number(s.quantity ?? 1) }))
      .filter((s) => s.sliceId > 0 && s.qty > 0)
  } catch {
    return []
  }
}

export interface CustomerOrderInput {
  customerId: number
  token: string
  address: string
  localiteId: number | null
  /** Indicatif seulement — le serveur recalcule. */
  montant: number
  orderHash: string
}

/** Commande connectée « à la livraison » (le panier serveur doit être à jour). */
export async function placeCustomerOrder(input: CustomerOrderInput): Promise<void> {
  try {
    await api.post(
      '/add-order-without-payment',
      {
        customer_id: input.customerId,
        address: input.address,
        montant: input.montant,
        order_id: input.orderHash,
        ...(input.localiteId != null ? { localite_id: input.localiteId } : {}),
      },
      bearer(input.token),
    )
  } catch (e) {
    fail(e, 'Commande impossible pour le moment. Réessayez.')
  }
}

/** Commande connectée payée en ligne : renvoie l'URL de paiement PayTech. */
export async function placeCustomerOrderWithPayment(input: CustomerOrderInput): Promise<string> {
  try {
    const res = await api.post(
      '/add-order-with-payment',
      {
        customer_id: input.customerId,
        address: input.address,
        montant: input.montant,
        order_id: input.orderHash,
        ...(input.localiteId != null ? { localite_id: input.localiteId } : {}),
      },
      bearer(input.token),
    )
    const data = res.data as PayTechResponse
    if (data?.success === 1 && data.redirect_url) return data.redirect_url
    throw new OrderApiError('Le paiement en ligne est momentanément indisponible. Choisissez le paiement à la livraison.')
  } catch (e) {
    if (e instanceof OrderApiError) throw e
    fail(e, 'Le paiement en ligne est momentanément indisponible. Choisissez le paiement à la livraison.')
  }
}

// ── Historique / statut réels ─────────────────────────────────────────────
/** Codes OrderStatus serveur → étapes de la chronologie v2. */
const STATUS_TO_STAGE: Record<number, 'received' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'> = {
  8: 'received', // AWAITING_PROCESSING
  16: 'preparing', // BEING_PROCESSED
  32: 'delivering', // IN_THE_PROCESS_OF_DELIVERY
  64: 'delivered', // DELIVERED
  80: 'cancelled', // CANCELLED
}

export interface ServerOrder {
  serverId: number
  serverRef: string
  createdAt: number
  montant: number
  deliveryFee: number
  stage: 'received' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  paid: boolean
  paymentMethod?: string
}

interface ApiOrder {
  id: number
  string_id: string
  montant: number | string
  delivery_fee?: number | string | null
  created_at?: string
  payment_method?: string | null
  status?: { code?: number } | null
  payment_status?: { code?: number } | null
  paymentStatus?: { code?: number } | null
}

/** Historique réel du client connecté (inclut ses commandes invitées, même n°). */
export async function fetchCustomerOrders(userId: number, token: string): Promise<ServerOrder[]> {
  try {
    const res = await api.get(`/get-customer-orders-by-user/${userId}`, bearer(token))
    const rows: ApiOrder[] = Array.isArray(res.data) ? res.data : []
    return rows.map((o) => {
      const payCode = o.payment_status?.code ?? o.paymentStatus?.code
      return {
        serverId: o.id,
        serverRef: String(o.string_id ?? ''),
        createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
        montant: Number(o.montant ?? 0),
        deliveryFee: Number(o.delivery_fee ?? 0),
        stage: STATUS_TO_STAGE[o.status?.code ?? 8] ?? 'received',
        paid: payCode === 8, // OrderPaymentStatus::PAID
        paymentMethod: o.payment_method ?? undefined,
      }
    })
  } catch {
    return []
  }
}
