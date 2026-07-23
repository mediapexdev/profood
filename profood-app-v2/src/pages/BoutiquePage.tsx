import { useMemo, useState } from 'react'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { ProductCard } from '../components/ProductCard'
import { Icon } from '../components/ui/Icon'
import { categoryLabel } from '../lib/catalog'
import type { Slice } from '../lib/catalog'
import { useCatalog } from '../contexts/CatalogContext'
import { useI18n } from '../i18n'

type Sort = 'pertinence' | 'prix-asc' | 'prix-desc'

/** Normalise pour une recherche tolérante aux accents/casse. */
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function BoutiquePage() {
  const { t } = useI18n()
  const SORTS: { key: Sort; label: string }[] = [
    { key: 'pertinence', label: t('shop.sortRelevance') },
    { key: 'prix-asc', label: t('shop.sortPriceAsc') },
    { key: 'prix-desc', label: t('shop.sortPriceDesc') },
  ]
  const { slices: SLICES, categories: CATEGORIES, slicesByCategory } = useCatalog()
  const [catId, setCatId] = useState<number>(CATEGORIES[0]?.id ?? 1)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('pertinence')

  const searching = query.trim().length > 0

  const slices = useMemo(() => {
    // Recherche : sur tout le catalogue, ignore la catégorie sélectionnée.
    const base: Slice[] = searching
      ? SLICES.filter((s) => norm(s.name).includes(norm(query.trim())))
      : slicesByCategory(catId)
    if (sort === 'prix-asc') return [...base].sort((a, b) => a.price - b.price)
    if (sort === 'prix-desc') return [...base].sort((a, b) => b.price - a.price)
    return base
  }, [catId, query, sort, searching, SLICES, slicesByCategory])

  return (
    <>
      <AppBar title="PROFOOD" />
      <Page>
        <div className="mx-auto max-w-6xl">
          <section className="px-4 md:px-6 pt-3 md:pt-8 pb-1">
            <p className="text-[11px] font-bold tracking-[.18em] uppercase text-taupe">{t('shop.kicker')}</p>
            <h2 className="text-[26px] md:text-4xl leading-tight mt-1 max-w-2xl">
              {t('shop.headingLead')} <span className="text-terre">{t('shop.headingHighlight')}</span>.
            </h2>
            <p className="text-taupe text-[14px] md:text-base mt-1.5 max-w-xl">{t('shop.subtitle')}</p>
            <span className="filet w-24 mt-4" />
          </section>

          {/* Recherche */}
          <div className="px-4 md:px-6 pt-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe"><Icon name="search" size={20} /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                className="w-full rounded-full border-[1.5px] border-sable bg-surface pl-10 pr-10 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors"
                type="search"
                aria-label={t('shop.searchAriaLabel')}
              />
              {searching && (
                <button onClick={() => setQuery('')} aria-label={t('shop.clearSearch')} className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full text-taupe active:bg-creme-dark">
                  <Icon name="close" size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Onglets catégories (masqués pendant une recherche) + tri */}
          {!searching && (
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
          )}

          {/* Ligne d'état : résultats + tri */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-6 pt-3">
            <span className="text-[13px] text-taupe">
              {searching
                ? t('shop.resultsFor', { count: slices.length, query: query.trim() })
                : t('shop.cutsCount', { count: slices.length })}
            </span>
            <div className="flex gap-1.5 shrink-0">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold border transition-colors ${sort === s.key ? 'bg-ink text-surface border-ink' : 'bg-surface text-taupe border-sable'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {slices.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 px-8 pt-16 text-taupe">
              <span className="opacity-40"><Icon name="search_off" size={48} /></span>
              <p className="font-title font-extrabold text-ink">{t('shop.noResultsTitle')}</p>
              <p className="text-[14px]">{t('shop.noResultsHint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-4 md:px-6 pt-3 md:pt-4">
              {slices.map((s) => <ProductCard key={s.id} slice={s} />)}
            </div>
          )}
        </div>
      </Page>
    </>
  )
}
