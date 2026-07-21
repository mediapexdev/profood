/**
 * Service commandes — persistance locale (invité) avec un JETON OPAQUE comme
 * identifiant public (jamais la référence énumérable YYMMDD+id, cf. plan de
 * refonte). Isole toute la logique de commande derrière une seule surface :
 * quand l'API Laravel sera branchée, seules ces fonctions changent.
 */
import type { CartLine } from '../contexts/CartContext'

export type OrderStage = 'received' | 'preparing' | 'delivering' | 'delivered'

export const STAGES: { key: OrderStage; label: string; icon: string }[] = [
  { key: 'received', label: 'Commande reçue', icon: 'receipt_long' },
  { key: 'preparing', label: 'En préparation', icon: 'skillet' },
  { key: 'delivering', label: 'En livraison', icon: 'local_shipping' },
  { key: 'delivered', label: 'Livrée', icon: 'check_circle' },
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
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
}): Order {
  const createdAt = Date.now()
  const order: Order = {
    token: opaqueToken(),
    ref: humanRef(createdAt),
    createdAt,
    customer: input.customer,
    lines: input.lines.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice, image: l.image })),
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.subtotal + input.deliveryFee,
  }
  writeAll([order, ...readAll()])
  return order
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

/** Étape courante estimée d'après le temps écoulé depuis la commande. */
export function currentStage(order: Order, now: number = Date.now()): OrderStage {
  const elapsed = (now - order.createdAt) / 60000
  let stage: OrderStage = 'received'
  for (const s of STAGES) if (elapsed >= OFFSETS_MIN[s.key]) stage = s.key
  return stage
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
