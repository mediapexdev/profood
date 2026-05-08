import { useCallback, useEffect, useState } from 'react'
import type { DailyStats } from '../types/index'
import { fetchDailyStats } from '../api/stats'
import mockStats from '../mocks/stats.json'

const MOCK_STATS = mockStats as unknown as DailyStats

export interface UseStatsReturn {
  stats: DailyStats
  loading: boolean
  error: string | null
  /** Manually re-fetch the statistics. */
  refresh: () => Promise<void>
}

/**
 * Returns today's delivery statistics for the current driver session.
 *
 * Data source strategy:
 *   1. On mount, fetch from GET /get-orders-statistics-details.
 *   2. On success, use real aggregate data (note: not livreur-specific yet).
 *   3. On failure, fall back to mock stats so the dashboard remains usable.
 *
 * BACKEND GAP: The statistics endpoint returns aggregate data for ALL orders,
 * not per-livreur. Some fields (deliveriesGrouped, deliveriesIndividual,
 * totalDistance, averageTime, totalAmount) have no equivalent in the current
 * API and are set to placeholder values.
 * See src/api/stats.ts and TODO_BACKEND_GAPS.md — Item 7.
 */
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<DailyStats>(MOCK_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDailyStats()
      setStats(data)
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number }
        message?: string
      }

      // 403/401 mean the endpoint is not accessible to this role.
      // Fall back to mock data silently so the dashboard renders.
      console.warn(
        '[useStats] API unavailable, falling back to mock data.',
        err
      )
      setStats(MOCK_STATS)
      setError(
        `Statistiques de démonstration (API : ${
          axiosError.response?.data?.message ??
          axiosError.message ??
          'erreur réseau'
        })`
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  return { stats, loading, error, refresh: loadStats }
}
