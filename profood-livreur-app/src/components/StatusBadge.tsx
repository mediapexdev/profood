/**
 * StatusBadge — pill-shaped label conveying a delivery's current status.
 *
 * Each status maps to a distinct colour pair (background + text) so drivers
 * can scan the list at a glance without reading every label. The colour
 * palette follows the brand guidelines: amber for waiting, primary orange
 * for active, green for success, red for problems.
 */

import type { DeliveryStatus } from '../types'

interface StatusBadgeProps {
  status: DeliveryStatus
}

interface BadgeConfig {
  label: string
  /** Tailwind utility classes for background and text colour. */
  classes: string
}

// Configuration is kept outside the component so it is created once, not on
// every render.
const STATUS_CONFIG: Record<DeliveryStatus, BadgeConfig> = {
  pending: {
    label: 'En attente',
    classes: 'bg-amber-100 text-amber-700',
  },
  in_progress: {
    label: 'En cours',
    classes: 'bg-primary/10 text-primary',
  },
  delivered: {
    label: 'Livré',
    classes: 'bg-green-100 text-green-700',
  },
  issue: {
    label: 'Problème',
    classes: 'bg-red-100 text-red-700',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${config.classes}`}
    >
      {config.label}
    </span>
  )
}
