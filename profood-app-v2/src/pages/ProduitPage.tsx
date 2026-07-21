import { useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { CutDiagram } from '../components/CutDiagram'
import { Icon } from '../components/ui/Icon'
import { SLICES, categoryLabel } from '../lib/catalog'
import { fmtFcfa } from '../lib/format'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { haptic } from '../lib/haptics'

export function ProduitPage() {
  const { id } = useParams()
  const slice = SLICES.find((s) => String(s.id) === id)
  const { add } = useCart()
  const { has, toggle } = useFavorites()

  if (!slice) {
    return (
      <>
        <AppBar title="Produit" back />
        <Page noTabbar><p className="p-6 text-taupe">Découpe introuvable.</p></Page>
      </>
    )
  }

  return (
    <>
      <AppBar title={slice.name} back />
      <Page noTabbar>
        <div className="mx-auto max-w-5xl md:px-6 md:pt-6 md:grid md:grid-cols-2 md:gap-8">
          <div className="aspect-square bg-creme md:rounded-card md:overflow-hidden md:border md:border-sable">
            <img src={slice.image} alt={slice.name} className="h-full w-full object-cover" />
          </div>

          <div className="px-4 pt-4 md:pt-0">
            <p className="text-[11px] font-bold tracking-[.16em] uppercase text-taupe">{categoryLabel(slice.category)} · {slice.weight} kg</p>
            <div className="flex items-start justify-between gap-3 mt-1">
              <h2 className="text-2xl md:text-3xl">{slice.name}</h2>
              <button
                onClick={() => { haptic('light'); toggle(slice.id) }}
                aria-label={has(slice.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-pressed={has(slice.id)}
                className={`shrink-0 grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-sable active:scale-90 transition ${has(slice.id) ? 'text-terre' : 'text-taupe'}`}
              >
                <Icon name="favorite" size={22} fill={has(slice.id)} />
              </button>
            </div>
            <p className="font-title text-2xl font-extrabold text-terre tabular-nums mt-3">{fmtFcfa(slice.price)}</p>

            <div className="mt-5 bg-creme-dark rounded-card p-4">
              <p className="text-[11px] font-bold tracking-[.16em] uppercase text-taupe mb-2">Sur l'animal</p>
              <CutDiagram sliceName={slice.name} size="lg" />
            </div>

            <p className="text-[14px] text-taupe leading-relaxed mt-5">
              Découpe de {categoryLabel(slice.category).toLowerCase()} sélectionnée le jour même, préparée par nos
              bouchers et livrée en chaîne du froid maîtrisée. Le poids exact est confirmé avant préparation.
            </p>

            <Button full className="mt-6" onClick={() => { haptic('medium'); add(slice) }}>Ajouter au panier</Button>
          </div>
        </div>
      </Page>
    </>
  )
}
