import { useMemo, useState } from 'react'
import type { Delivery, DeliveryStatus } from '../types/index'
import rawDeliveries from '../mocks/deliveries.json'

// Double-cast via unknown because the JSON inferred type uses `null` for
// optional avatar fields and `string` for the status literal union, whereas
// the Delivery interface uses `string | undefined` and a narrow union type.
// The actual runtime data is correct; this cast is intentional.
const initialDeliveries = rawDeliveries as unknown as Delivery[]

export interface UseDeliveriesReturn {
  deliveries: Delivery[]
  /** Returns the delivery matching the given id, or undefined if not found. */
  getDelivery: (id: string) => Delivery | undefined
  /** Updates the status of a single delivery in local state. */
  updateStatus: (id: string, status: DeliveryStatus) => void
  /** Deliveries currently pending or in progress. */
  activeDeliveries: Delivery[]
  /** Deliveries that are delivered or have an issue. */
  completedDeliveries: Delivery[]
}

/**
 * Provides access to the delivery list and mutation helpers.
 *
 * State is local — in a production implementation these operations would
 * also dispatch API calls (PATCH /api/deliveries/:id/status) and
 * optimistically update the list.
 */
export function useDeliveries(): UseDeliveriesReturn {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)

  const getDelivery = (id: string): Delivery | undefined => {
    return deliveries.find((d) => d.id === id)
  }

  const updateStatus = (id: string, status: DeliveryStatus): void => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    )
  }

  // Memoised derived views — only recomputed when the deliveries array
  // reference changes (i.e. after a status update).
  const activeDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'pending' || d.status === 'in_progress'),
    [deliveries]
  )

  const completedDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'delivered' || d.status === 'issue'),
    [deliveries]
  )

  return { deliveries, getDelivery, updateStatus, activeDeliveries, completedDeliveries }
}
