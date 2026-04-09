import { useMemo, useState } from 'react'
import type { Notification, NotificationType } from '../types/index'
import rawNotifications from '../mocks/notifications.json'

// Double-cast via unknown: the JSON inferred type uses `null` for optional
// avatar fields and `string` for the NotificationType literal union.
const initialNotifications = rawNotifications as unknown as Notification[]

export interface UseNotificationsReturn {
  notifications: Notification[]
  /** Number of notifications that have not yet been read. */
  unreadCount: number
  /** Marks a single notification as read by id. */
  markAsRead: (id: string) => void
  /** Marks every notification as read. */
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
 * In production, the initial list would be fetched from
 * GET /api/livreur/notifications and mutations would call
 * PATCH /api/livreur/notifications/:id/read etc.
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  // Only recalculated when the notifications array changes.
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = (id: string): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = (): void => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filterByType = (type: NotificationType | 'all'): Notification[] => {
    if (type === 'all') return notifications
    return notifications.filter((n) => n.type === type)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, filterByType }
}
