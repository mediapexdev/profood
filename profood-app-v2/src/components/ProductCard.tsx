import { useNavigate } from 'react-router-dom'
import type { Slice } from '../lib/catalog'
import { categoryLabel } from '../lib/catalog'
import { fmtFcfa } from '../lib/format'
import { CutDiagram } from './CutDiagram'
import { Icon } from './ui/Icon'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

/**
 * Carte produit — reprend le patron du site vitrine : image carrée, pastille
 * catégorie, prix en terre, et le schéma de découpe qui se révèle au survol
 * (desktop). Sur mobile, le schéma vit sur la fiche produit.
 */
export function ProductCard({ slice }: { slice: Slice }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { qtyOf, add, setQty } = useCart()
  const { has, toggle } = useFavorites()
  const qty = qtyOf(slice.id)
  const fav = has(slice.id)

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-card border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${qty > 0 ? 'border-terre ring-1 ring-terre' : 'border-sable'}`}
    >
      <button
        onClick={() => navigate(`/produit/${slice.id}`)}
        className="relative aspect-square overflow-hidden bg-creme text-left"
        aria-label={slice.name}
      >
        <img src={slice.image} alt={slice.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-terre px-2.5 py-0.5 font-title text-[10px] font-bold uppercase tracking-wide text-white">
          {categoryLabel(slice.category)}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={fav ? t('productCard.removeFavorite', { name: slice.name }) : t('productCard.addFavorite', { name: slice.name })}
          aria-pressed={fav}
          onClick={(e) => { e.stopPropagation(); haptic('light'); toggle(slice.id) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); haptic('light'); toggle(slice.id) } }}
          className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-surface/90 backdrop-blur transition active:scale-90 ${fav ? 'text-terre' : 'text-taupe'}`}
        >
          <Icon name="favorite" size={18} fill={fav} />
        </span>
        {/* Schéma de découpe révélé au survol (desktop) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 border-t border-sable bg-surface/95 px-2.5 py-2 opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <CutDiagram sliceName={slice.name} />
        </div>
      </button>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-title text-sm font-bold leading-snug">{slice.name}</h3>
        <p className="mt-0.5 text-xs text-taupe">{categoryLabel(slice.category)} · {slice.weight} kg</p>
        <div className="mt-3 flex flex-1 items-end justify-between gap-2">
          <span className="font-title text-base font-extrabold text-terre tabular-nums">{fmtFcfa(slice.price)}</span>
          {qty === 0 ? (
            <button
              onClick={() => { haptic('medium'); add(slice) }}
              className="rounded-full bg-encre dark:bg-terre px-4 py-2 font-title text-xs font-bold text-white transition hover:bg-terre dark:hover:bg-terre-dark active:scale-95"
            >
              {t('productCard.add')}
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-terre text-white">
              <button aria-label={t('productCard.removeQty', { name: slice.name })} onClick={() => { haptic('light'); setQty(slice.id, qty - 1) }} className="h-8 w-8 rounded-full font-title text-base font-bold active:scale-90">−</button>
              <span className="min-w-4 text-center font-title text-sm font-bold tabular-nums">{qty}</span>
              <button aria-label={t('productCard.addQty', { name: slice.name })} onClick={() => { haptic('light'); setQty(slice.id, qty + 1) }} className="h-8 w-8 rounded-full font-title text-base font-bold active:scale-90">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
