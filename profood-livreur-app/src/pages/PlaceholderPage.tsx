/**
 * PlaceholderPage — generic "coming soon" screen.
 *
 * Used for routes that are planned but not yet implemented (e.g. Revenus,
 * Profil). Accepts a title and an icon name so each route can show
 * contextually appropriate content while sharing a single component.
 *
 * Props:
 *   title — displayed as the page heading
 *   icon  — Material Symbol name shown in the primary-tinted circle
 */

import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'

interface PlaceholderPageProps {
  /** Page title shown in both the header and the body text. */
  title: string
  /** Material Symbol icon name displayed in the central illustration. */
  icon: string
}

export function PlaceholderPage({ title, icon }: PlaceholderPageProps) {
  return (
    <div className="min-h-dvh bg-background-light pb-nav">
      <PageHeader title={title} />

      {/* Centered illustration + message */}
      <div className="flex flex-col items-center justify-center gap-5 pt-24 px-8">
        {/* Icon in a large primary-tinted circle */}
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name={icon} size="xl" className="text-primary" />
        </div>

        {/* Page name */}
        <h1 className="text-lg font-bold text-gray-900 text-center">{title}</h1>

        {/* Coming-soon message */}
        <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
          Cette fonctionnalité sera disponible prochainement.
        </p>
      </div>
    </div>
  )
}
