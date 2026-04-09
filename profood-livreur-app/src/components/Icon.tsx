/**
 * Icon — thin wrapper around Material Symbols Outlined.
 *
 * The font is loaded in index.html via the Google Fonts CDN. Filling is
 * achieved via the FILL axis in the variable font rather than a separate
 * icon set, keeping the bundle lightweight.
 */

interface IconProps {
  name: string
  filled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Map semantic size names to Tailwind font-size utilities.
// Material Symbols inherits font-size, so these classes control icon size.
const sizeClasses: Record<NonNullable<IconProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export function Icon({ name, filled = false, className = '', size = 'md' }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      // The FILL axis (0 = outline, 1 = filled) is controlled via a CSS
      // font-variation-settings override rather than a class so we don't
      // need a separate icon set or additional stylesheet.
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
