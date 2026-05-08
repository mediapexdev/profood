import apiClient from './client'
import type { Delivery, DeliveryStatus } from '../types'

/**
 * Raw order shape returned by GET /get-orders from the Laravel API.
 * Only the fields we actually consume in the livreur app are listed.
 * The API may include many additional fields that we discard.
 */
interface ApiOrder {
  id: number
  string_id: string
  // Order status object returned by the API
  order_status: {
    id: number
    wording: string // e.g. "En attente", "En cours de livraison", "Livré"
  } | null
  order_payment_status: {
    id: number
    wording: string
  } | null
  // Customer info — may be null for guest orders
  customer: {
    id: number
    user: {
      first_name: string
      last_name: string
      phone_number: string
      avatar: string | null
    }
  } | null
  // Guest order fields — populated when customer is null
  guest_name: string | null
  guest_phone: string | null
  // Delivery address stored as free-text or structured object
  delivery_address: string | null
  delivery_commune: string | null
  delivery_localite: string | null
  // Boxes in the order (each box contains multiple items)
  boxes: ApiBox[]
  total_amount: number
  // ISO 8601 string
  created_at: string
  // Planned delivery time if set by manager
  scheduled_at: string | null
  notes: string | null
}

interface ApiBox {
  id: number
  box_type: {
    id: number
    name: string
  } | null
  box_slices: ApiBoxSlice[]
  quantity: number
}

interface ApiBoxSlice {
  id: number
  slice: {
    id: number
    name: string
    weight_in_grams: number | null
  } | null
  quantity: number
}

/**
 * Maps the order status wording from the API to the DeliveryStatus union
 * used throughout the livreur app UI.
 *
 * BACKEND GAP: There is no dedicated "livreur-facing" status — the mapping
 * below is a best-effort interpretation of the existing OrderStatus wordings.
 * The backend should expose a LIVREUR-specific status field or delivery
 * assignment model so the mapping is unambiguous.
 * See TODO_BACKEND_GAPS.md — Item 2.
 */
function mapOrderStatusToDeliveryStatus(
  statusWording: string | null | undefined
): DeliveryStatus {
  if (!statusWording) return 'pending'
  const w = statusWording.toLowerCase()
  if (w.includes('cours') || w.includes('livraison')) return 'in_progress'
  if (w.includes('livré') || w.includes('livre') || w.includes('complet')) return 'delivered'
  if (w.includes('problème') || w.includes('annul') || w.includes('refus')) return 'issue'
  return 'pending'
}

/**
 * Formats a weight in grams as a human-readable string (e.g. "1.5 kg", "500 g").
 */
function formatWeight(grams: number | null | undefined): string | undefined {
  if (grams == null) return undefined
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`
}

/**
 * Converts a raw API order to the Delivery shape expected by the UI.
 *
 * The API order model does not have a direct address.street / address.city
 * breakdown — we reconstruct it from the flat delivery_address and
 * delivery_localite fields.
 */
function mapApiOrderToDelivery(order: ApiOrder, stopNumber: number): Delivery {
  // Resolve customer name and phone — handle both registered and guest orders.
  const customerName = order.customer
    ? `${order.customer.user.first_name} ${order.customer.user.last_name}`.trim()
    : (order.guest_name ?? 'Client inconnu')

  const customerPhone = order.customer
    ? order.customer.user.phone_number
    : (order.guest_phone ?? '')

  const customerAvatar = order.customer?.user.avatar ?? undefined

  // Build a flat address string from available fields.
  const street = order.delivery_address ?? ''
  const city = [order.delivery_commune, order.delivery_localite]
    .filter(Boolean)
    .join(', ')

  // Flatten boxes → items for the UI's simplified items list.
  const items = order.boxes.flatMap((box) =>
    box.box_slices.map((bs) => ({
      name: bs.slice?.name ?? (box.box_type?.name ?? 'Article'),
      quantity: bs.quantity,
      weight: formatWeight(bs.slice?.weight_in_grams),
    }))
  )

  // Scheduled time — fall back to order creation time when no schedule set.
  const scheduledTime = order.scheduled_at
    ? new Date(order.scheduled_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(order.created_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })

  return {
    id: String(order.id),
    orderRef: `PF-${order.id}`,
    status: mapOrderStatusToDeliveryStatus(order.order_status?.wording),
    customer: {
      name: customerName,
      phone: customerPhone,
      avatar: customerAvatar,
    },
    address: { street, city },
    items,
    scheduledTime,
    // Estimated duration is not available from the API.
    // BACKEND GAP: See TODO_BACKEND_GAPS.md — Item 3.
    estimatedDuration: '–',
    amount: order.total_amount,
    notes: order.notes ?? undefined,
    stopNumber,
  }
}

/**
 * Fetches all orders from GET /get-orders.
 *
 * This returns ALL orders accessible to the authenticated user.
 *
 * BACKEND GAP (HIGH PRIORITY): There is no endpoint that returns only the
 * orders assigned to the current livreur.  Until GET /livreur/deliveries
 * exists, we fetch all orders and filter by status on the client side.
 * This is not scalable — a busy day might have hundreds of orders.
 * See TODO_BACKEND_GAPS.md — Item 1.
 */
export async function fetchDeliveries(): Promise<Delivery[]> {
  const response = await apiClient.get<ApiOrder[]>('/get-orders')
  const orders = response.data

  return orders.map((order, index) =>
    mapApiOrderToDelivery(order, index + 1)
  )
}

/**
 * Fetches a single order by id from GET /get-order/:id.
 *
 * BACKEND GAP: There is no single-order endpoint exposed in routes/api.php.
 * We fall back to fetching all orders and finding the one with the matching id.
 * See TODO_BACKEND_GAPS.md — Item 5.
 */
export async function fetchDelivery(id: string): Promise<Delivery | undefined> {
  const all = await fetchDeliveries()
  return all.find((d) => d.id === id)
}

/**
 * Updates the delivery status for an order by calling POST /update-order-status.
 *
 * The API expects:
 *   { order_id: number, order_status_id: number }
 *
 * BACKEND GAP: The mapping from DeliveryStatus to order_status_id is
 * hardcoded here because there is no status-listing endpoint exposed for
 * livreur use.  If the OrderStatus table ids change this mapping breaks.
 * See TODO_BACKEND_GAPS.md — Item 6.
 *
 * Known status ids (based on the seeder data visible in the manager app):
 *   1 = En attente
 *   2 = Confirmée
 *   3 = En cours de livraison
 *   4 = Livrée
 *   5 = Problème / Annulée  (may vary)
 */
const STATUS_ID_MAP: Record<DeliveryStatus, number> = {
  pending: 1,
  in_progress: 3,
  delivered: 4,
  issue: 5,
}

export async function updateDeliveryStatus(
  orderId: string,
  status: DeliveryStatus
): Promise<void> {
  await apiClient.post('/update-order-status', {
    order_id: Number(orderId),
    order_status_id: STATUS_ID_MAP[status],
  })
}
