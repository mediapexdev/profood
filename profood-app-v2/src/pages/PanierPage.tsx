import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCart } from '../contexts/CartContext'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'

export function PanierPage() {
  const { lines, total, setQty } = useCart()
  const navigate = useNavigate()

  if (!lines.length) {
    return (
      <>
        <AppBar title="Mon panier" />
        <Page>
          <div className="flex flex-col items-center justify-center text-center gap-3 px-8 pt-24 text-taupe">
            <span className="opacity-40"><Icon name="shopping_bag" size={54} /></span>
            <p className="font-title font-extrabold text-lg text-ink">Votre panier est vide</p>
            <p className="text-[14px]">Parcourez la boutique et ajoutez vos découpes préférées.</p>
            <Button className="mt-2" onClick={() => navigate('/')}>Voir la boutique</Button>
          </div>
        </Page>
      </>
    )
  }

  return (
    <>
      <AppBar title="Mon panier" />
      <Page>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 flex flex-col gap-3">
          {lines.map(({ slice, qty }) => (
            <div key={slice.id} className="flex items-center gap-3 bg-surface border border-sable rounded-card p-3">
              <img src={slice.image} alt={slice.name} className="w-16 h-16 shrink-0 rounded-lg object-cover bg-creme" />
              <div className="flex-1 min-w-0">
                <p className="font-title font-bold text-[15px] truncate">{slice.name}</p>
                <p className="text-[12px] text-taupe tabular-nums">{fmtFcfa(slice.price)}</p>
              </div>
              <div className="inline-flex items-center border-[1.5px] border-sable rounded-full overflow-hidden">
                <button className="w-9 h-9 grid place-items-center active:bg-creme-dark" aria-label="Retirer" onClick={() => { haptic('light'); setQty(slice.id, qty - 1) }}><Icon name="remove" size={18} /></button>
                <span className="min-w-9 text-center font-bold tabular-nums">{qty}</span>
                <button className="w-9 h-9 grid place-items-center active:bg-creme-dark" aria-label="Ajouter" onClick={() => { haptic('light'); setQty(slice.id, qty + 1) }}><Icon name="add" size={18} /></button>
              </div>
            </div>
          ))}

          <div className="pt-3">
            <div className="flex justify-between items-center">
              <span className="text-taupe">Sous-total</span>
              <span className="font-title font-extrabold text-xl tabular-nums">{fmtFcfa(total)}</span>
            </div>
            <p className="text-[12px] text-taupe mt-1">Frais de livraison calculés à l'étape suivante, selon votre zone.</p>
            <Button full className="mt-4" onClick={() => haptic('medium')}>Commander</Button>
          </div>
        </div>
      </Page>
    </>
  )
}
