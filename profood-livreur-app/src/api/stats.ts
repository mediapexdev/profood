import apiClient from './client'
import type { DailyStats } from '../types'

/**
 * Shape returned by GET /get-livreur-stats.
 *
 * The backend sends camelCase keys so the mapping below is straightforward.
 * Fields that are not provided by this endpoint (totalDistance, averageTime)
 * remain as '– ' placeholders in the returned DailyStats object.
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
}

/**
 * Fetches the authenticated livreur's statistics for a given calendar day.
 *
 * @param date - Optional date in Y-m-d format (e.g. "2026-05-08").
 *               When omitted the backend defaults to today in Africa/Dakar tz.
 *
 * Maps the API response to the DailyStats shape consumed by the UI.
 * Fields that the new endpoint does not provide are left as placeholder
 * strings rather than fabricated values:
 *   - totalDistance  → '– km'   (no GPS tracking in the backend)
 *   - averageTime    → '– min'  (no delivery-time tracking in the backend)
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
    // totalDistance is not tracked by the backend — render '–' in the UI
    totalDistance:        '– km',
    // averageTime is not tracked by the backend — render '–' in the UI
    averageTime:          '– min',
  }
}
