import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Notification, NotificationType } from '../types/index'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications'
import mockNotifications from '../mocks/notifications.json'

// Double-cast via unknown: the JSON inferred type uses `null` for optional
// fields and `string` for the NotificationType literal union.
const MOCK_NOTIFICATIONS = mockNotifications as unknown as Notification[]

export interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  /** Number of notifications that have not yet been read. */
  unreadCount: number
  /** Marks a single notification as read by id (local + API). */
  markAsRead: (id: string) => void
  /** Marks every notification as read (local + API). */
  markAllAsRead: () => void
  /**
   * Returns notifications filtered by type.
   * Pass 'all' to receive the full list.
   */
  filterByType: (type: NotificationType | 'all') => Notification[]
}

/**
 * Manages in-app notifications state.
 *
 * Data source strategy:
 *   1. On mount, attempt GET /livreur/notifications (stub — currently no-ops).
 *   2. If the response is empty (endpoint not yet implemented), seed with
 *      the local mock data so the UI remains usable during development.
 *   3. Mutations (mark read) are applied locally AND sent to the API.
 *
 * BACKEND GAP: The notifications endpoint does not yet exist.
 * This hook falls back to mock data automatically.
 * See src/api/notifications.ts and TODO_BACKEND_GAPS.md — Item 8.
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications()
      // The stub returns [] until the backend endpoint is built.
      // Fall back to mock data so the UI always shows something.
      setNotifications(data.length > 0 ? data : MOCK_NOTIFICATIONS)
    } catch {
      // Any error → use mock data silently.
      setNotifications(MOCK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = (id: string): void => {
    // Optimistic local update.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    // Fire-and-forget API call (no-op until endpoint exists).
    void markNotificationRead(id)
  }

  const markAllAsRead = (): void => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    void markAllNotificationsRead()
  }

  const filterByType = (type: NotificationType | 'all'): Notification[] => {
    if (type === 'all') return notifications
    return notifications.filter((n) => n.type === type)
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    filterByType,
  }
}
