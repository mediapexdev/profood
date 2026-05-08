import apiClient from './client'
import type { DailyStats } from '../types'

/**
 * Shape returned by GET /get-orders-statistics-details.
 * Only the top-level fields we use for deriving DailyStats are typed here.
 */
interface ApiOrderStatistics {
  all: { number: number }
  awaitingProcessing: { number: number }
  beingProcessed: { number: number }
  inTheProcessOfDelivery: { number: number }
  delivered: { number: number }
  cancelled: { number: number }
}

/**
 * Fetches today's delivery statistics by querying the global order statistics
 * endpoint with today's date as both start and end.
 *
 * BACKEND GAP (MEDIUM):
 * GET /get-orders-statistics-details is a manager-facing endpoint that returns
 * aggregate statistics across ALL orders, not just those assigned to the
 * current livreur.  The fields deliveriesGrouped, deliveriesIndividual,
 * totalDistance, and averageTime have no equivalent in the API.
 *
 * Until a livreur-specific statistics endpoint exists (suggested:
 * GET /livreur/stats?date=YYYY-MM-DD), this function derives a best-effort
 * DailyStats from the available global data.
 *
 * See TODO_BACKEND_GAPS.md — Item 7.
 */
export async function fetchDailyStats(): Promise<DailyStats> {
  const today = new Date().toISOString().split('T')[0]

  const response = await apiClient.get<ApiOrderStatistics>(
    '/get-orders-statistics-details',
    { params: { start_date: today, end_date: today } }
  )

  const d = response.data

  const total = d.all.number
  const delivered = d.delivered.number
  const inProgress = d.inTheProcessOfDelivery.number
  const pending = d.awaitingProcessing.number + d.beingProcessed.number
  const issues = d.cancelled.number

  return {
    deliveriesTotal: total,
    // Grouped / Individual split is not in the API — return total as a fallback.
    // TODO: Backend gap — no split between grouped and individual deliveries.
    deliveriesGrouped: 0,
    deliveriesIndividual: total,
    deliveriesCompleted: delivered,
    deliveriesInProgress: inProgress,
    deliveriesPending: pending,
    deliveriesWithIssues: issues,
    // Distance and time are not available from the API.
    // TODO: Backend gap — no route distance or average time tracking.
    totalDistance: '– km',
    averageTime: '– min',
    totalAmount: 0, // Not returned by the statistics endpoint.
  }
}
