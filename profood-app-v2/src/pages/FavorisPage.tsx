import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ProductCard } from '../components/ProductCard'
import { SLICES } from '../lib/catalog'
import { useFavorites } from '../contexts/FavoritesContext'

export function FavorisPage() {
  const navigate = useNavigate()
  const { ids } = useFavorites()
  const favs = ids.map((id) => SLICES.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s)

  return (
    <>
      <AppBar title="Mes découpes favorites" back />
      <Page noTabbar>
        {favs.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 px-8 pt-24 text-taupe">
            <span className="opacity-40"><Icon name="favorite" size={54} /></span>
            <p className="font-title font-extrabold text-lg text-ink">Aucun favori</p>
            <p className="text-[14px]">Touchez le cœur sur une découpe pour la retrouver ici.</p>
            <Button className="mt-2" onClick={() => navigate('/')}>Voir la boutique</Button>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 px-4 md:px-6 pt-4">
            {favs.map((s) => <ProductCard key={s.id} slice={s} />)}
          </div>
        )}
      </Page>
    </>
  )
}
