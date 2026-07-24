/**
 * Anneau de progression SVG : la couronne se remplit (dashoffset animé avec
 * la courbe ressort) au rythme de `value / max`. La couleur suit
 * `currentColor` — piloter via une classe texte (text-terre, text-halal…).
 */
export function ProgressRing({
  value, max, size = 40, stroke = 4, className = '', children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  className?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = max > 0 ? Math.min(1, value / max) : 0

  return (
    <span className={`relative inline-grid place-items-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sable)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
          className="transition-[stroke-dashoffset] duration-500"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        />
      </svg>
      {children && <span className="absolute inset-0 grid place-items-center">{children}</span>}
    </span>
  )
}
