import { haptic } from '../../lib/haptics'

type Variant = 'primary' | 'ghost' | 'dark'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-braise text-white shadow-[0_8px_20px_-8px_rgba(240,124,36,.7)] active:bg-braise-deep',
  ghost: 'bg-transparent text-ink border-[1.5px] border-line-2 active:bg-panel-2',
  dark: 'bg-ink text-bg active:opacity-90',
}

export function Button({
  variant = 'primary', full = false, className = '', onClick, children, ...rest
}: {
  variant?: Variant
  full?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      {...rest}
      onClick={() => { haptic('light'); onClick?.() }}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-full px-6 py-3 text-[15px] transition-[transform,background-color] active:scale-[.98] ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
