import { DIAGRAMS, getCutInfo, zoneLabels } from '../lib/anatomy'

/**
 * Planche de découpe : illustration gravure de l'animal (asset PROFOOD) avec
 * la/les zone(s) de la découpe en surbrillance orange. Réutilise la carte de
 * zones et le mapping découpe→zone du site vitrine.
 */
export function CutDiagram({ sliceName, size = 'sm' }: { sliceName: string; size?: 'sm' | 'lg' }) {
  const info = getCutInfo(sliceName)
  if (!info) return null

  const diagram = DIAGRAMS[info.animal]
  const whole = info.zones.length === 0

  return (
    <div className="flex items-center gap-3">
      <div className={`relative shrink-0 overflow-hidden rounded-md bg-surface ${size === 'lg' ? 'h-32' : 'h-16'} aspect-[3/2]`}>
        <img src={diagram.src} alt={`Croquis : ${zoneLabels(info)}`} className="absolute inset-0 h-full w-full object-contain" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {whole ? (
            <ellipse cx="52" cy="48" rx="42" ry="38" fill="var(--color-terre)" fillOpacity="0.3" stroke="var(--color-terre)" strokeWidth="0.8" strokeDasharray="3 2" />
          ) : (
            info.zones.map((zid) => {
              const z = diagram.zones[zid]
              if (!z) return null
              return (
                <ellipse
                  key={zid}
                  cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                  fill="var(--color-terre)" fillOpacity="0.45"
                  stroke="var(--color-terre)" strokeWidth="1" strokeDasharray="3 2"
                  className="animate-pop"
                />
              )
            })
          )}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="font-title text-xs font-bold leading-tight text-ink">{zoneLabels(info)}</p>
        <p className="text-[11px] text-taupe">
          {whole
            ? info.animal === 'volaille' ? 'Volaille entière' : "Sélection sur l'ensemble"
            : `Découpe ${info.animal === 'volaille' ? 'de la volaille' : `du ${info.animal}`}`}
        </p>
      </div>
    </div>
  )
}
