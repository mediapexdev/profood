/**
 * Notifications API module.
 *
 * BACKEND GAP (HIGH PRIORITY):
 * There is currently no notifications endpoint in the Profood API
 * (routes/api.php does not include any /notifications route).
 *
 * Until the following endpoints are implemented, this module provides
 * typed stubs that resolve immediately with empty data rather than
 * making failing network calls:
 *
 *   GET  /livreur/notifications             — list driver notifications
 *   PATCH /livreur/notifications/:id/read   — mark a notification as read
 *   PATCH /livreur/notifications/read-all   — mark all as read
 *
 * See TODO_BACKEND_GAPS.md — Item 8.
 */

import type { Notification } from '../types'

/**
 * Returns an empty list until the backend notifications endpoint is available.
 * The hook layer (useNotifications) seeds with local mock data as a fallback
 * when this returns an empty array.
 */
export async function fetchNotifications(): Promise<Notification[]> {
  // TODO: Replace with real API call once the endpoint exists:
  // const response = await apiClient.get<Notification[]>('/livreur/notifications')
  // return response.data
  return Promise.resolve([])
}

/**
 * No-op until the backend endpoint is available.
 */
export async function markNotificationRead(_id: string): Promise<void> {
  // TODO: await apiClient.patch(`/livreur/notifications/${_id}/read`)
  return Promise.resolve()
}

/**
 * No-op until the backend endpoint is available.
 */
export async function markAllNotificationsRead(): Promise<void> {
  // TODO: await apiClient.patch('/livreur/notifications/read-all')
  return Promise.resolve()
}
