import { fmtFcfa } from '../../lib/format'

export function Price({ amount, unit, size = 'md' }: {
  amount: number
  unit?: string
  size?: 'md' | 'lg'
}) {
  return (
    <div className="flex flex-col">
      <span className={`font-title font-extrabold tabular-nums tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
        {fmtFcfa(amount)}
      </span>
      {unit && <span className="text-[11px] font-bold text-terre-deep">{unit}</span>}
    </div>
  )
}
