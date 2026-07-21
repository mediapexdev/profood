type Tone = 'cat' | 'fresh' | 'pop' | 'out'

const TONES: Record<Tone, string> = {
  cat: 'bg-ink text-surface',
  fresh: 'bg-halal/12 text-halal border border-halal/40',
  pop: 'bg-terre text-white',
  out: 'bg-transparent text-alerte border border-alerte',
}

export function Chip({ tone = 'cat', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${TONES[tone]}`}>
      {children}
    </span>
  )
}
