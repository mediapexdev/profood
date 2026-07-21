import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { getOrder, estimatedDelivery } from '../lib/orders'
import { fmtFcfa } from '../lib/format'

export function ConfirmationPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const order = getOrder(token)

  if (!order) {
    return (
      <>
        <AppBar title="Commande" back />
        <Page noTabbar><p className="p-6 text-taupe">Commande introuvable.</p></Page>
      </>
    )
  }

  return (
    <>
      <AppBar title="Commande confirmée" />
      <Page noTabbar>
        <div className="mx-auto max-w-lg px-5 md:px-6 pt-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-halal/15 grid place-items-center text-halal animate-pop">
            <Icon name="check_circle" size={52} fill />
          </div>
          <h2 className="font-title font-extrabold text-2xl mt-4">Merci, {order.customer.name.split(' ')[0]} !</h2>
          <p className="text-taupe mt-1">Votre commande est bien reçue. Nous préparons vos découpes.</p>

          <div className="w-full bg-surface border border-sable rounded-card p-4 mt-6 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-taupe">Référence</span>
              <span className="font-title font-bold tabular-nums">{order.ref}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[13px] text-taupe">Livraison estimée</span>
              <span className="font-bold">~ {estimatedDelivery(order)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[13px] text-taupe">Total</span>
              <span className="font-title font-extrabold tabular-nums">{fmtFcfa(order.total)}</span>
            </div>
            <div className="filet w-full my-3" />
            <p className="text-[13px] text-taupe">Livraison à <span className="text-ink font-semibold">{order.customer.commune}</span> — paiement à la réception.</p>
          </div>

          <Button full className="mt-6" onClick={() => navigate(`/suivi/${order.token}`)}>
            <Icon name="local_shipping" size={20} /> Suivre ma commande
          </Button>
          <Button full variant="ghost" className="mt-3" onClick={() => navigate('/')}>Continuer mes achats</Button>
        </div>
      </Page>
    </>
  )
}
