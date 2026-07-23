/**
 * Service commandes — persistance locale (invité) avec un JETON OPAQUE comme
 * identifiant public (jamais la référence énumérable YYMMDD+id, cf. plan de
 * refonte). Isole toute la logique de commande derrière une seule surface :
 * quand l'API Laravel sera branchée, seules ces fonctions changent.
 */
import type { MsgKey } from '../i18n/fr'

export type OrderStage = 'received' | 'preparing' | 'delivering' | 'delivered'

export const STAGES: { key: OrderStage; labelKey: MsgKey; icon: string }[] = [
  { key: 'received', labelKey: 'order.stage.received', icon: 'receipt_long' },
  { key: 'preparing', labelKey: 'order.stage.preparing', icon: 'skillet' },
  { key: 'delivering', labelKey: 'order.stage.delivering', icon: 'local_shipping' },
  { key: 'delivered', labelKey: 'order.stage.delivered', icon: 'check_circle' },
]

export interface OrderCustomer {
  name: string
  phone: string
  email?: string
  address: string
  zoneId: string
  commune: string
  note?: string
}

export interface OrderLine {
  name: string
  qty: number
  unitPrice: number
  image: string
}

export interface Order {
  token: string
  ref: string
  createdAt: number
  customer: OrderCustomer
  lines: OrderLine[]
  subtotal: number
  deliveryFee: number
  total: number
  /** Renseignés quand la commande est passée via l'API (VITE_USE_API_ORDERS). */
  serverId?: number
  serverRef?: string
  paymentMethod?: 'cod' | 'online'
  paid?: boolean
  /** Statut réel du serveur (prime sur la simulation temporelle). */
  serverStage?: OrderStage | 'cancelled'
}

const STORAGE_KEY = 'profood.orders.v1'

function readAll(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Order[]) : []
  } catch {
    return []
  }
}

function writeAll(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

/** Jeton public opaque, non devinable. */
function opaqueToken(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '')
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

/** Référence lisible (affichage humain seulement, non utilisée pour retrouver). */
function humanRef(createdAt: number): string {
  const d = new Date(createdAt)
  const p = (n: number) => String(n).padStart(2, '0')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `PF-${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}-${suffix}`
}

export function createOrder(input: {
  customer: OrderCustomer
  /** Structurel : les CartLine du panier conviennent telles quelles. */
  lines: OrderLine[]
  subtotal: number
  deliveryFee: number
  serverId?: number
  serverRef?: string
  paymentMethod?: 'cod' | 'online'
  paid?: boolean
}): Order {
  const createdAt = Date.now()
  const order: Order = {
    token: opaqueToken(),
    // La référence serveur (string_id) fait foi quand elle existe.
    ref: input.serverRef || humanRef(createdAt),
    createdAt,
    customer: input.customer,
    lines: input.lines.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice, image: l.image })),
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.subtotal + input.deliveryFee,
    serverId: input.serverId,
    serverRef: input.serverRef,
    paymentMethod: input.paymentMethod,
    paid: input.paid,
  }
  writeAll([order, ...readAll()])
  return order
}

/** Met à jour une commande locale (ex. statut réel rapporté par le serveur). */
export function patchOrder(token: string, patch: Partial<Order>): Order | undefined {
  const orders = readAll()
  const i = orders.findIndex((o) => o.token === token)
  if (i < 0) return undefined
  orders[i] = { ...orders[i], ...patch, token: orders[i].token }
  writeAll(orders)
  return orders[i]
}

export function listOrders(): Order[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt)
}

export function getOrder(token: string | undefined): Order | undefined {
  if (!token) return undefined
  return readAll().find((o) => o.token === token)
}

// Jalons de progression (démo sans backend : dérivés du temps écoulé pour que
// la chronologie « avance » sous les yeux du client). Avec l'API, l'étape
// viendra du serveur et ces offsets ne serviront plus qu'à estimer l'heure.
const OFFSETS_MIN: Record<OrderStage, number> = {
  received: 0,
  preparing: 2,
  delivering: 6,
  delivered: 12,
}

/**
 * Étape courante : le statut SERVEUR fait foi quand il est connu ; sinon
 * simulation d'après le temps écoulé (mode démo). Une commande annulée est
 * rendue comme 'received' ici — les écrans testent `isCancelled()` à part.
 */
export function currentStage(order: Order, now: number = Date.now()): OrderStage {
  if (order.serverStage) return order.serverStage === 'cancelled' ? 'received' : order.serverStage
  const elapsed = (now - order.createdAt) / 60000
  let stage: OrderStage = 'received'
  for (const s of STAGES) if (elapsed >= OFFSETS_MIN[s.key]) stage = s.key
  return stage
}

export function isCancelled(order: Order): boolean {
  return order.serverStage === 'cancelled'
}

/** Horodatage estimé (ms) auquel une étape est / sera atteinte. */
export function stageTime(order: Order, stage: OrderStage): number {
  return order.createdAt + OFFSETS_MIN[stage] * 60000
}

/** Heure de livraison estimée, formatée (HH:MM). */
export function estimatedDelivery(order: Order): string {
  return new Date(stageTime(order, 'delivered')).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Paiement en ligne : commande en attente de retour PayTech ─────────────
// Avant la redirection vers PayTech, on gèle un brouillon de commande sous le
// hash `order_id` transmis au serveur ; la page de retour le finalise
// (succès → commande locale + panier vidé) ou le relâche (annulation).
export interface PendingPayment {
  hash: string
  createdAt: number
  customer: OrderCustomer
  lines: OrderLine[]
  subtotal: number
  deliveryFee: number
}

const PENDING_KEY = 'profood.pending-payment.v1'

export function savePendingPayment(p: PendingPayment): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(p))
}

export function readPendingPayment(hash: string | undefined): PendingPayment | undefined {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw || !hash) return undefined
    const p = JSON.parse(raw) as PendingPayment
    return p.hash === hash ? p : undefined
  } catch {
    return undefined
  }
}

export function clearPendingPayment(): void {
  localStorage.removeItem(PENDING_KEY)
}
