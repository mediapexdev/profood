/**
 * PageHeader — sticky top bar shared across all detail / sub-pages.
 *
 * Rendered above the page's scrollable content. The frosted-glass effect
 * (bg-white/80 + backdrop-blur-md) keeps the header readable over any
 * background colour without a fully opaque bar that feels heavy on mobile.
 *
 * Props:
 *   title      — text displayed in the centre of the bar
 *   showBack   — when true, renders a back-chevron button on the left
 *   rightAction — optional node rendered on the right (e.g. action button)
 */

import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  rightAction?: ReactNode
}

export function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary/10"
      style={{ paddingTop: 'var(--sai-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left slot — back button or empty spacer so title stays centred */}
        <div className="w-10">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
              aria-label="Retour"
            >
              <Icon name="arrow_back" size="md" />
            </button>
          )}
        </div>

        <h1 className="flex-1 text-center text-base font-bold text-gray-900 truncate">
          {title}
        </h1>

        {/* Right slot — custom action or empty spacer */}
        <div className="w-10 flex items-center justify-end">
          {rightAction ?? null}
        </div>
      </div>
    </header>
  )
}
