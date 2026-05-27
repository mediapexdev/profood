import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Delivery, DeliveryStatus } from '../types/index'
import { fetchDeliveries, updateDeliveryStatus } from '../api/orders'
import mockDeliveries from '../mocks/deliveries.json'
import { useCurrentPosition } from './useCurrentPosition'
import { haversineKm } from '../lib/distance'

// Double-cast via unknown: the JSON inferred type uses `null` for optional
// avatar fields and `string` for the status literal union.
const MOCK_DELIVERIES = mockDeliveries as unknown as Delivery[]

export interface UseDeliveriesReturn {
  deliveries: Delivery[]
  loading: boolean
  error: string | null
  /** Returns the delivery matching the given id, or undefined if not found. */
  getDelivery: (id: string) => Delivery | undefined
  /**
   * Updates the status of a delivery both locally (optimistic) and remotely.
   * On API failure the previous status is restored and an error is set.
   */
  updateStatus: (id: string, status: DeliveryStatus) => Promise<void>
  /** Re-fetches the delivery list from the API. */
  refresh: () => Promise<void>
  /** Deliveries currently pending or in progress. */
  activeDeliveries: Delivery[]
  /** Deliveries that are delivered or have an issue. */
  completedDeliveries: Delivery[]
}

/**
 * Provides access to the delivery list and mutation helpers.
 *
 * Data source strategy:
 *   1. On mount, attempt to load deliveries from GET /get-orders.
 *   2. If the request succeeds, use real data.
 *   3. If the request fails (network offline, 401, or backend gap), fall back
 *      to the local mock data so the UI remains functional during development
 *      or when the API is unavailable.
 *
 * Status updates call POST /update-order-status optimistically — the local
 * state is updated immediately and rolled back on API failure.
 *
 * BACKEND GAP: GET /get-orders returns ALL orders, not only those assigned to
 * the current livreur. See src/api/orders.ts and TODO_BACKEND_GAPS.md — Item 1.
 */
export function useDeliveries(): UseDeliveriesReturn {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentPosition = useCurrentPosition()

  const loadDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchDeliveries()
      setDeliveries(data)
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number }
        message?: string
      }

      // 401 → user is not authenticated; let the AuthGuard handle redirect.
      // All other errors → fall back to mock data with a visible warning.
      const status = axiosError.response?.status
      if (status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.')
        setDeliveries([])
      } else {
        // Development fallback: use mock data so the UI is usable even when
        // the API is unreachable or the livreur endpoint is not yet implemented.
        console.warn(
          '[useDeliveries] API unavailable, falling back to mock data.',
          err
        )
        setDeliveries(MOCK_DELIVERIES)
        setError(
          `Données de démonstration (API indisponible : ${
            axiosError.response?.data?.message ?? axiosError.message ?? 'erreur réseau'
          })`
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on first mount.
  useEffect(() => {
    void loadDeliveries()
  }, [loadDeliveries])

  const getDelivery = (id: string): Delivery | undefined =>
    deliveries.find((d) => d.id === id)

  /**
   * Optimistic status update:
   *   1. Save current status in case we need to roll back.
   *   2. Apply the new status locally immediately.
   *   3. Send the update to the API.
   *   4. On failure, restore the previous status.
   */
  const updateStatus = async (
    id: string,
    status: DeliveryStatus
  ): Promise<void> => {
    const previous = deliveries.find((d) => d.id === id)?.status
    if (previous === undefined) return

    // Optimistic update.
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    )

    try {
      await updateDeliveryStatus(id, status)
    } catch (err) {
      // Rollback on failure.
      console.error('[useDeliveries] Failed to update status:', err)
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: previous } : d))
      )
      setError(
        'Impossible de mettre à jour le statut. Veuillez réessayer.'
      )
    }
  }

  // Ordering rules:
  //   1. in_progress always before pending — once a livreur is mid-delivery
  //      the next stop should keep being that one until confirmed.
  //   2. Within the same status, sort by geographic distance from the
  //      livreur's current GPS so MapPage / Dashboard always surface the
  //      closest reachable stop. Stops without coords drop to the end of
  //      their tier (distance = +Infinity).
  //   3. If no GPS fix yet, fall back to the API order (stable sort).
  const activeDeliveries = useMemo(() => {
    const active = deliveries.filter(
      (d) => d.status === 'pending' || d.status === 'in_progress'
    )

    const statusRank = (s: DeliveryStatus) => (s === 'in_progress' ? 0 : 1)

    const distanceTo = (d: Delivery): number => {
      if (!currentPosition) return 0
      const c = d.address.coordinates
      if (!c) return Number.POSITIVE_INFINITY
      return haversineKm(currentPosition, c)
    }

    return [...active].sort((a, b) => {
      const r = statusRank(a.status) - statusRank(b.status)
      if (r !== 0) return r
      return distanceTo(a) - distanceTo(b)
    })
  }, [deliveries, currentPosition])

  const completedDeliveries = useMemo(
    () =>
      deliveries.filter(
        (d) => d.status === 'delivered' || d.status === 'issue'
      ),
    [deliveries]
  )

  return {
    deliveries,
    loading,
    error,
    getDelivery,
    updateStatus,
    refresh: loadDeliveries,
    activeDeliveries,
    completedDeliveries,
  }
}
