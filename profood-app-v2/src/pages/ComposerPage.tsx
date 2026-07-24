import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { ProgressRing } from '../components/ui/ProgressRing'
import { DIAGRAMS, getCutInfo } from '../lib/anatomy'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useCart } from '../contexts/CartContext'
import { useCatalog } from '../contexts/CatalogContext'
import { useI18n } from '../i18n'

const CAPACITY = 8
const BEEF = DIAGRAMS.boeuf

export function ComposerPage() {
  const { t } = useI18n()
  const [picks, setPicks] = useState<number[]>([])
  const { addBox } = useCart()
  const { slices: SLICES } = useCatalog()
  const navigate = useNavigate()

  /** Découpes de bœuf disponibles en box et localisables sur la planche. */
  const CANDIDATES = useMemo(
    () => SLICES.filter(
      (s) => s.categoryId === 1 && s.availableInBox && (getCutInfo(s.name)?.zones.length ?? 0) > 0,
    ).slice(0, 12),
    [SLICES],
  )

  const toggle = (id: number) => {
    haptic('light')
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= CAPACITY) return prev
      return [...prev, id]
    })
  }

  // Zones allumées, avec leur intensité : plus une zone est demandée par la
  // sélection, plus elle s'illumine.
  const activeZones = useMemo(() => {
    const map = new Map<string, number>()
    for (const id of picks) {
      const s = SLICES.find((x) => x.id === id)
      if (s) getCutInfo(s.name)?.zones.forEach((z) => map.set(z, (map.get(z) ?? 0) + 1))
    }
    return map
  }, [picks, SLICES])

  // Somme des prix réels des découpes : identique au montant que le serveur
  // recalcule quand la box est décomposée en lignes de découpes (API).
  const total = useMemo(
    () => picks.reduce((sum, id) => sum + (SLICES.find((x) => x.id === id)?.price ?? 0), 0),
    [picks, SLICES],
  )

  const addToCart = () => {
    if (!picks.length) return
    haptic('medium')
    addBox(t('box.composed', { count: picks.length }), total, picks, BEEF.src)
    setPicks([])
    navigate('/panier')
  }

  return (
    <>
      <AppBar title={t('composer.title')} />
      <Page>
        <div className="mx-auto max-w-3xl px-4 md:px-6 pt-3 md:pt-6">
          {/* Planche gravure + zones */}
          <div className="relative rounded-card overflow-hidden border border-sable bg-surface aspect-[3/2]">
            <img src={BEEF.src} alt={t('composer.chartAlt')} className="absolute inset-0 h-full w-full object-contain" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {Array.from(activeZones).map(([zid, n]) => {
                const z = BEEF.zones[zid]
                if (!z) return null
                const intensity = Math.min(0.3 + n * 0.14, 0.62)
                return (
                  <g key={zid} className="zone-glow">
                    {/* Halo doux qui respire, puis cœur de zone. */}
                    <ellipse cx={z.cx} cy={z.cy} rx={z.rx * 1.35} ry={z.ry * 1.35}
                      fill="var(--color-lumiere)" fillOpacity={intensity * 0.35} />
                    <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                      fill="var(--color-terre)" fillOpacity={intensity} stroke="var(--color-terre)"
                      strokeWidth="1" strokeDasharray="3 2" />
                  </g>
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
            <span className="text-taupe">{t('composer.selection')}</span>
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-title font-extrabold text-2xl tabular-nums">{fmtFcfa(total)}</span>
              <span className="text-[11px] font-bold text-terre-dark">
                {t('composer.perCut', { amount: picks.length ? `~${fmtFcfa(Math.round(total / picks.length))}` : '—' })}
              </span>
            </div>
            {/* La box « se remplit » : anneau qui suit la sélection. */}
            <ProgressRing
              value={picks.length}
              max={CAPACITY}
              size={56}
              stroke={5}
              className={picks.length >= CAPACITY ? 'text-halal' : 'text-terre'}
            >
              <span className="font-title text-[13px] font-extrabold tabular-nums">{picks.length}/{CAPACITY}</span>
            </ProgressRing>
          </div>
          <Button full disabled={!picks.length} className="mt-4" onClick={addToCart}>
            {picks.length ? t('composer.addToCart') : t('composer.pickCuts')}
          </Button>
          <p className="text-[12px] text-taupe mt-3">{t('composer.priceNote')}</p>
        </div>
      </Page>
    </>
  )
}
