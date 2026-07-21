type Tone = 'cat' | 'fresh' | 'pop' | 'out'

const TONES: Record<Tone, string> = {
  cat: 'bg-ink text-bg',
  fresh: 'bg-froid-tint text-[#1c5f5c] dark:text-[#bfe3e2] border border-froid',
  pop: 'bg-braise text-white',
  out: 'bg-transparent text-alerte border border-alerte',
}

export function Chip({ tone = 'cat', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${TONES[tone]}`}>
      {children}
    </span>
  )
}
