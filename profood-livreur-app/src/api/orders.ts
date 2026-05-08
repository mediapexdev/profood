import apiClient from './client'
import type { Delivery, DeliveryStatus } from '../types'

interface ApiOrderStatus {
  id: number
  code: number
  wording: string
}

interface ApiOrderPaymentStatus {
  id: number
  code?: number
  wording: string
}

interface ApiOrder {
  id: number
  string_id: string
  address: string
  montant: number | string
  payment_method: string | null
  is_guest_order: boolean
  guest_first_name: string | null
  guest_last_name: string | null
  guest_phone_number: string | null
  guest_email: string | null
  status: ApiOrderStatus | null
  payment_status: ApiOrderPaymentStatus | null
  customer: {
    id: number
    user: {
      first_name: string
      last_name: string
      phone_number: string
      avatar: string | null
    }
  } | null
  cart: {
    id: number
    boxesData?: ApiBox[]
    slicesData?: ApiCartSlice[]
  } | null
  created_at: string
}

interface ApiBox {
  id: number
  type: { id: number; name: string } | null
  box_slices: Array<{
    id: number
    quantity: number
    slice?: { id: number; name: string; weight_in_grams: number | null } | null
  }>
}

interface ApiCartSlice {
  id: number
  quantity: number
  slice: { id: number; name: string; weight_in_grams: number | null } | null
}

// OrderStatus.code constants from app/Models/OrderStatus.php
const ORDER_STATUS_CODE = {
  AWAITING_PROCESSING: 8,
  BEING_PROCESSED: 16,
  IN_THE_PROCESS_OF_DELIVERY: 32,
  DELIVERED: 64,
  CANCELLED: 80,
} as const

// DeliveryStatus → OrderStatus.code (NOT id — id is fetched dynamically)
const DELIVERY_STATUS_TO_CODE: Record<DeliveryStatus, number> = {
  pending: ORDER_STATUS_CODE.AWAITING_PROCESSING,
  in_progress: ORDER_STATUS_CODE.IN_THE_PROCESS_OF_DELIVERY,
  delivered: ORDER_STATUS_CODE.DELIVERED,
  issue: ORDER_STATUS_CODE.CANCELLED,
}

let statusIdCache: Map<number, number> | null = null

/**
 * Fetch the OrderStatus rows once and build a code->id lookup.
 * Refreshes if a status code is requested but missing from the cache.
 */
async function getStatusCodeToIdMap(): Promise<Map<number, number>> {
  if (statusIdCache) return statusIdCache
  const res = await apiClient.get<ApiOrderStatus[]>('/get-order-statuses')
  statusIdCache = new Map(res.data.map((s) => [s.code, s.id]))
  return statusIdCache
}

function mapStatusCodeToDeliveryStatus(code: number | null | undefined): DeliveryStatus {
  switch (code) {
    case ORDER_STATUS_CODE.IN_THE_PROCESS_OF_DELIVERY:
      return 'in_progress'
    case ORDER_STATUS_CODE.DELIVERED:
      return 'delivered'
    case ORDER_STATUS_CODE.CANCELLED:
      return 'issue'
    default:
      return 'pending'
  }
}

function formatWeight(grams: number | null | undefined): string | undefined {
  if (grams == null) return undefined
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`
}

function mapApiOrderToDelivery(order: ApiOrder, stopNumber: number): Delivery {
  const customerName = order.is_guest_order
    ? `${order.guest_first_name ?? ''} ${order.guest_last_name ?? ''}`.trim() || 'Client invité'
    : order.customer
      ? `${order.customer.user.first_name} ${order.customer.user.last_name}`.trim()
      : 'Client inconnu'

  const customerPhone = order.is_guest_order
    ? order.guest_phone_number ?? ''
    : order.customer?.user.phone_number ?? ''

  const customerAvatar = order.customer?.user.avatar ?? undefined

  const boxes = order.cart?.boxesData ?? []
  const slices = order.cart?.slicesData ?? []

  const boxItems = boxes.flatMap((b) =>
    b.box_slices.map((bs) => ({
      name: bs.slice?.name ?? b.type?.name ?? 'Article',
      quantity: bs.quantity,
      weight: formatWeight(bs.slice?.weight_in_grams),
    }))
  )

  const sliceItems = slices.map((s) => ({
    name: s.slice?.name ?? 'Article',
    quantity: s.quantity,
    weight: formatWeight(s.slice?.weight_in_grams),
  }))

  const scheduledTime = new Date(order.created_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    id: String(order.id),
    orderRef: order.string_id ? order.string_id : `PF-${order.id}`,
    status: mapStatusCodeToDeliveryStatus(order.status?.code),
    customer: { name: customerName, phone: customerPhone, avatar: customerAvatar },
    address: { street: order.address ?? '', city: '' },
    items: [...boxItems, ...sliceItems],
    scheduledTime,
    estimatedDuration: '–',
    amount: typeof order.montant === 'string' ? Number(order.montant) : order.montant,
    notes: undefined,
    stopNumber,
  }
}

/**
 * Fetch all orders assigned to the authenticated livreur.
 */
export async function fetchDeliveries(): Promise<Delivery[]> {
  const response = await apiClient.get<ApiOrder[]>('/get-livreur-deliveries')
  return response.data.map((order, index) => mapApiOrderToDelivery(order, index + 1))
}

/**
 * Fetch a single delivery assigned to the authenticated livreur.
 */
export async function fetchDelivery(id: string): Promise<Delivery | undefined> {
  try {
    const response = await apiClient.get<ApiOrder>(`/get-livreur-delivery/${id}`)
    return mapApiOrderToDelivery(response.data, 1)
  } catch (e) {
    return undefined
  }
}

/**
 * Update the status of a delivery via POST /livreur-update-order-status.
 * The OrderStatus id is resolved from /get-order-statuses (cached).
 */
export async function updateDeliveryStatus(
  orderId: string,
  status: DeliveryStatus
): Promise<void> {
  const code = DELIVERY_STATUS_TO_CODE[status]
  const map = await getStatusCodeToIdMap()
  const statusId = map.get(code)

  if (statusId == null) {
    throw new Error(`OrderStatus with code ${code} not found on the server`)
  }
  await apiClient.post('/livreur-update-order-status', {
    order_id: Number(orderId),
    status_id: statusId,
  })
}
