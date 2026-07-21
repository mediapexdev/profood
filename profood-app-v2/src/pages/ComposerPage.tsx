import { useMemo, useState } from 'react'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { SLICES, PRICE_PER_CUT } from '../lib/catalog'
import { DIAGRAMS, getCutInfo } from '../lib/anatomy'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'

const CAPACITY = 8

/** Découpes de bœuf disponibles en box et localisables sur la planche. */
const CANDIDATES = SLICES.filter(
  (s) => s.categoryId === 1 && s.availableInBox && (getCutInfo(s.name)?.zones.length ?? 0) > 0,
).slice(0, 12)

const BEEF = DIAGRAMS.boeuf

export function ComposerPage() {
  const [picks, setPicks] = useState<number[]>([])

  const toggle = (id: number) => {
    haptic('light')
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= CAPACITY) return prev
      return [...prev, id]
    })
  }

  // Zones allumées = union des zones des découpes choisies.
  const activeZones = useMemo(() => {
    const set = new Set<string>()
    for (const id of picks) {
      const s = SLICES.find((x) => x.id === id)
      if (s) getCutInfo(s.name)?.zones.forEach((z) => set.add(z))
    }
    return set
  }, [picks])

  const total = picks.length * PRICE_PER_CUT

  return (
    <>
      <AppBar title="Composer ma box" />
      <Page>
        <div className="mx-auto max-w-3xl px-4 md:px-6 pt-3 md:pt-6">
          {/* Planche gravure + zones */}
          <div className="relative rounded-card overflow-hidden border border-sable bg-surface aspect-[3/2]">
            <img src={BEEF.src} alt="Planche de découpe du bœuf" className="absolute inset-0 h-full w-full object-contain" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {Array.from(activeZones).map((zid) => {
                const z = BEEF.zones[zid]
                if (!z) return null
                return (
                  <ellipse key={zid} cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                    fill="var(--color-terre)" fillOpacity="0.45" stroke="var(--color-terre)"
                    strokeWidth="1" strokeDasharray="3 2" className="animate-pop" />
                )
              })}
            </svg>
          </div>

          {/* Emplacements */}
          <div className="flex gap-1.5 flex-wrap mt-4">
            {Array.from({ length: CAPACITY }).map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg grid place-items-center text-sm transition-colors ${i < picks.length ? 'border-[1.5px] border-terre bg-terre/15 text-terre-dark' : 'border-[1.5px] border-dashed border-sable text-taupe/50'}`}>
                {i < picks.length ? '✓' : ''}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-taupe">Sélection</span>
            <span className="font-bold tabular-nums">{picks.length} / {CAPACITY}</span>
          </div>

          {/* Découpes */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CANDIDATES.map((s) => {
              const on = picks.includes(s.id)
              return (
                <button key={s.id} onClick={() => toggle(s.id)} aria-pressed={on}
                  className={`text-[13px] font-bold px-3.5 py-1.5 rounded-full border-[1.5px] transition-colors ${on ? 'bg-terre text-white border-terre' : 'bg-surface text-ink border-sable'}`}>
                  {s.name}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-title font-extrabold text-2xl tabular-nums">{fmtFcfa(total)}</span>
              <span className="text-[11px] font-bold text-terre-dark">soit {picks.length ? fmtFcfa(PRICE_PER_CUT) : '—'} la découpe</span>
            </div>
          </div>
          <Button full className="mt-4" onClick={() => haptic('medium')}>Ajouter la box au panier</Button>
          <p className="text-[12px] text-taupe mt-3">Le prix se met à jour à chaque choix — jamais recalculé côté client au moment de payer.</p>
        </div>
      </Page>
    </>
  )
}
