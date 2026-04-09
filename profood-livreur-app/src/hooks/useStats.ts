import type { DailyStats } from '../types/index'
import statsData from '../mocks/stats.json'

/**
 * Returns the daily statistics for the current driver session.
 *
 * Currently returns static mock data. In production this would call
 * GET /api/livreur/stats?date=<today> and refresh periodically.
 */
export function useStats(): DailyStats {
  return statsData as unknown as DailyStats
}
