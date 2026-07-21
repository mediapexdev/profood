/** Material Symbols Rounded. `fill` bascule sur la variante pleine (onglet actif). */
export function Icon({ name, fill = false, size = 24, className = '' }: {
  name: string
  fill?: boolean
  size?: number
  className?: string
}) {
  return (
    <span
      className={`material-symbols-rounded${fill ? ' fill' : ''} ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
