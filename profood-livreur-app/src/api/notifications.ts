/**
 * Notifications API module.
 *
 * Backs the in-app inbox shown on NotificationsPage. The backend
 * persists notifications in the `livreur_notifications` table — see
 * api-profood/app/Http/Controllers/LivreurController.php for the
 * endpoints. New rows are created when a manager assigns an order
 * via /assign-livreur-to-order. Push notifications come later.
 */

import apiClient from './client'
import type { Notification, NotificationType } from '../types'

interface ApiLivreurNotification {
  id: number
  type: string
  title: string
  body: string
  order_id: number | null
  read_at: string | null
  created_at: string
}

const TYPES = new Set<NotificationType>([
  'delivery',
  'schedule',
  'message',
  'payment',
  'alert',
])

function normaliseType(raw: string): NotificationType {
  return (TYPES.has(raw as NotificationType) ? raw : 'alert') as NotificationType
}

// Quick-and-cheap relative time formatter — good enough for the inbox.
// Anything older than a week falls back to a localised date.
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return "À l'instant"
  if (diff < hour) return `Il y a ${Math.floor(diff / minute)} min`
  if (diff < day) return `Il y a ${Math.floor(diff / hour)} h`
  if (diff < 7 * day) return `Il y a ${Math.floor(diff / day)} j`
  return new Date(iso).toLocaleDateString('fr-FR')
}

function mapApiNotification(row: ApiLivreurNotification): Notification {
  return {
    id: String(row.id),
    type: normaliseType(row.type),
    title: row.title,
    body: row.body,
    time: formatRelativeTime(row.created_at),
    read: row.read_at !== null,
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<ApiLivreurNotification[]>(
    '/get-livreur-notifications'
  )
  return response.data.map(mapApiNotification)
}

export async function markNotificationRead(id: string): Promise<void> {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) return
  await apiClient.post('/livreur-mark-notification-read', { id: numericId })
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/livreur-mark-all-notifications-read')
}
