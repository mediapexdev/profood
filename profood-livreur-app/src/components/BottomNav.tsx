/**
 * BottomNav — persistent tab bar fixed to the viewport bottom.
 *
 * Uses react-router-dom NavLink so each tab automatically receives an
 * "active" state when its route matches. The active tab is highlighted with
 * the brand primary colour and its icon switches to the filled variant for
 * stronger visual feedback.
 *
 * Bottom padding uses env(safe-area-inset-bottom) so the bar clears the
 * iOS home-indicator on notch devices and falls back to a comfortable 12px
 * on devices / browsers that do not expose safe-area insets.
 */

import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

interface Tab {
  to: string
  label: string
  icon: string
}

// Ordered as they appear left-to-right in the tab bar.
const TABS: Tab[] = [
  { to: '/', label: 'Missions', icon: 'local_shipping' },
  { to: '/historique', label: 'Historique', icon: 'history' },
  { to: '/profil', label: 'Profil', icon: 'person' },
  { to: '/notifications', label: 'Notifs', icon: 'notifications' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary/10 pt-2 max-w-[480px] mx-auto"
      style={{ paddingBottom: 'max(12px, var(--sai-bottom))' }}
    >
      <ul className="flex items-center justify-around">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            {/*
             * NavLink's `end` prop ensures the "/" root only matches exactly,
             * preventing it from being active on every route.
             */}
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={tab.icon} filled={isActive} size="md" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
