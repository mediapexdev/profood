import { useMemo, useState } from 'react'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES, slicesByCategory, categoryLabel } from '../lib/catalog'

export function BoutiquePage() {
  const [catId, setCatId] = useState<number>(CATEGORIES[0]?.id ?? 1)
  const slices = useMemo(() => slicesByCategory(catId), [catId])

  return (
    <>
      <AppBar title="PROFOOD" />
      <Page>
        <div className="mx-auto max-w-6xl">
          <section className="px-4 md:px-6 pt-3 md:pt-8 pb-1">
            <p className="text-[11px] font-bold tracking-[.18em] uppercase text-taupe">Boucherie halal · Dakar</p>
            <h2 className="text-[26px] md:text-4xl leading-tight mt-1 max-w-2xl">
              Chaque morceau à sa <span className="text-terre">juste place</span>.
            </h2>
            <p className="text-taupe text-[14px] md:text-base mt-1.5 max-w-xl">Choisissez vos découpes, nous préparons et livrons à Dakar.</p>
            <span className="filet w-24 mt-4" />
          </section>

          {/* Onglets catégories */}
          <div className="sticky top-14 md:top-16 z-10 bg-creme/85 backdrop-blur px-4 md:px-6 py-2.5 flex gap-2 overflow-x-auto no-select">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold border-[1.5px] transition-colors ${catId === c.id ? 'bg-terre text-white border-terre' : 'bg-surface text-ink border-sable'}`}
              >
                {categoryLabel(c.name)} <span className="opacity-60 tabular-nums">{c.slicesCount}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-4 md:px-6 pt-2 md:pt-4">
            {slices.map((s) => <ProductCard key={s.id} slice={s} />)}
          </div>
        </div>
      </Page>
    </>
  )
}
