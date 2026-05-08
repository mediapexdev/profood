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
 *   1. On mount, fetch from GET /get-livreur-stats?date=YYYY-MM-DD.
 *   2. On success, use real per-livreur data for the requested day.
 *   3. On failure, fall back to mock stats so the dashboard remains usable.
 *
 * Fields not provided by the endpoint (totalDistance, averageTime) are
 * rendered as '–' placeholders. See src/api/stats.ts for details.
 */
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<DailyStats>(MOCK_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    // Pass today's date so the request is explicit; the backend defaults to
    // today in Africa/Dakar tz when no date is supplied, but being explicit
    // prevents any ambiguity around midnight in different timezones.
    const today = new Date().toISOString().split('T')[0]
    try {
      const data = await fetchDailyStats(today)
      setStats(data)
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number }
        message?: string
      }

      // Network errors or 4xx/5xx fall back to mock data so the dashboard
      // remains usable when the API is unreachable (e.g. offline field use).
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
