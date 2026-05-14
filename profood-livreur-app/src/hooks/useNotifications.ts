import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Notification, NotificationType } from '../types/index'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications'

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
 * Manages the in-app notifications inbox.
 *
 * Backed by `livreur_notifications` on the API — see
 * api/notifications.ts. Mutations are optimistic locally and
 * fire-and-forget to the backend.
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications()
      setNotifications(data)
    } catch {
      setNotifications([])
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
