/**
 * NotificationsPage — inbox for all driver notifications with tab filtering.
 *
 * Layout (top → bottom):
 *   1. PageHeader with "mark all read" action
 *   2. Sticky tab bar: Toutes | Livraisons | Messages
 *   3. Notification cards (unread highlighted with white bg + left primary bar)
 *
 * Unread notifications are visually distinct so the driver can scan them at
 * a glance without having to read every card body.
 *
 * Tab "Messages" maps to the 'message' NotificationType. All other tabs map
 * to their corresponding type or 'all'. The 'Livraisons' tab aggregates
 * 'delivery', 'schedule', 'payment', and 'alert' types since all of these
 * relate to the delivery workflow.
 */

import { useState } from 'react'
import type { NotificationType } from '../types'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useNotifications } from '../hooks/useNotifications'

// ── Tab configuration ─────────────────────────────────────────────────────────

type TabId = 'all' | 'deliveries' | 'messages'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'deliveries', label: 'Livraisons' },
  { id: 'messages', label: 'Messages' },
]

// ── Per-type icon and colour configuration ────────────────────────────────────

interface TypeConfig {
  icon: string
  /** Tailwind bg + text colour classes for the icon circle. */
  circleClasses: string
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  delivery: {
    icon: 'local_shipping',
    circleClasses: 'bg-primary text-white',
  },
  schedule: {
    icon: 'schedule',
    circleClasses: 'bg-primary/10 text-primary',
  },
  message: {
    icon: 'message',
    circleClasses: 'bg-blue-100 text-blue-600',
  },
  payment: {
    icon: 'payments',
    circleClasses: 'bg-green-100 text-green-600',
  },
  alert: {
    icon: 'warning',
    circleClasses: 'bg-primary/10 text-primary',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [activeTab, setActiveTab] = useState<TabId>('all')

  /**
   * Filter the notification list based on the selected tab.
   * "Livraisons" shows everything except 'message' — delivery, schedule,
   * payment, and alert are all part of the delivery workflow.
   */
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'messages') return n.type === 'message'
    // deliveries tab
    const deliveryTypes: NotificationType[] = ['delivery', 'schedule', 'payment', 'alert']
    return deliveryTypes.includes(n.type)
  })

  return (
    <div className="min-h-dvh bg-background-light pb-nav">
      <PageHeader
        title="Notifications"
        showBack
        rightAction={
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
            aria-label="Tout marquer comme lu"
          >
            <Icon name="done_all" size="md" />
          </button>
        }
      />

      {/* ── Sticky tab bar ────────────────────────────────────────────────── */}
      <div
        className="sticky z-10 bg-white/80 backdrop-blur-md border-b border-primary/10"
        style={{ top: 'calc(65px + var(--sai-top))' }}
      >
        <div className="flex ">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification list ─────────────────────────────────────────────── */}
      <main className=" pt-4 px-4 flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-16">
            <Icon name="notifications_off" size="xl" className="text-gray-300" />
            <p className="text-gray-400 text-sm font-semibold">Aucune notification</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const typeConfig = TYPE_CONFIG[notif.type]

            return (
              <div
                key={notif.id}
                className={`rounded-2xl shadow-sm overflow-hidden transition-colors ${
                  notif.read ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* Left unread indicator bar */}
                <div className="flex">
                  <div
                    className={`w-1 flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary'}`}
                  />

                  <div className="flex-1 p-4">
                    {/* Icon + title + time */}
                    <div className="flex items-start gap-3">
                      {/* Coloured icon circle */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.circleClasses}`}
                      >
                        <Icon name={typeConfig.icon} size="sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${
                              notif.read ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons (if present) */}
                    {notif.actions && notif.actions.length > 0 && (
                      <div className="flex gap-2 mt-3 ml-12">
                        {notif.actions.map((action, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                              action.variant === 'primary'
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
