import { haptic } from '../../lib/haptics'

type Variant = 'primary' | 'ghost' | 'dark'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-terre text-white shadow-[0_8px_20px_-8px_rgba(240,124,36,.7)] active:bg-terre-dark',
  ghost: 'bg-transparent text-ink border-[1.5px] border-sable active:bg-creme-dark',
  dark: 'bg-ink text-surface active:opacity-90',
}

export function Button({
  variant = 'primary', full = false, disabled = false, className = '', onClick, children, ...rest
}: {
  variant?: Variant
  full?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={() => { if (disabled) return; haptic('light'); onClick?.() }}
      className={`inline-flex items-center justify-center gap-2 font-title font-bold rounded-full px-6 py-3 text-[15px] transition-[transform,background-color,opacity] active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
