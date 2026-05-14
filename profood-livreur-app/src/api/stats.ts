import apiClient from './client'
import type { DailyStats } from '../types'

/**
 * Shape returned by GET /get-livreur-stats. Both totalDistanceKm and
 * averageDeliverySeconds are recent additions — they may be null when
 * GPS tracking has not produced enough points yet, or when no delivered
 * order has both an "in-progress" and a "delivered" history row for the
 * day.
 */
interface ApiLivreurStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  cancelled: number
  totalAmount: number
  deliveriesGrouped: number
  deliveriesIndividual: number
  totalDistanceKm?: number | null
  averageDeliverySeconds?: number | null
}

function formatDistance(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km) || km <= 0) return '– km'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(km < 10 ? 1 : 0)} km`
}

function formatAverageTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '– min'
  if (seconds < 60) return `${Math.round(seconds)} s`
  const minutes = seconds / 60
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const remainder = Math.round(minutes - hours * 60)
  return remainder > 0 ? `${hours} h ${remainder} min` : `${hours} h`
}

/**
 * Fetches the authenticated livreur's statistics for a given calendar day.
 *
 * @param date - Optional date in Y-m-d format (e.g. "2026-05-08").
 *               When omitted the backend defaults to today in Africa/Dakar tz.
 */
export async function fetchDailyStats(date?: string): Promise<DailyStats> {
  const params: Record<string, string> = {}
  if (date) {
    params['date'] = date
  }

  const response = await apiClient.get<ApiLivreurStats>(
    '/get-livreur-stats',
    { params }
  )

  const d = response.data

  return {
    deliveriesTotal:      d.total,
    deliveriesGrouped:    d.deliveriesGrouped,
    deliveriesIndividual: d.deliveriesIndividual,
    deliveriesCompleted:  d.completed,
    deliveriesInProgress: d.inProgress,
    deliveriesPending:    d.pending,
    // cancelled maps to "issues" in the UI vocabulary
    deliveriesWithIssues: d.cancelled,
    totalAmount:          d.totalAmount,
    totalDistance:        formatDistance(d.totalDistanceKm),
    averageTime:          formatAverageTime(d.averageDeliverySeconds),
  }
}
