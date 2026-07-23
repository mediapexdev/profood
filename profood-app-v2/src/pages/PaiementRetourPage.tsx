import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCart } from '../contexts/CartContext'
import { createOrder, readPendingPayment, clearPendingPayment } from '../lib/orders'
import { useI18n } from '../i18n'

/**
 * Retour de paiement PayTech. Le serveur construit les URLs de retour à partir
 * de `client_app_url` :
 *   invité   → /guest-order-success/{hash}?ref={string_id}   (succès)
 *              /views/cart                                    (annulation, chemin v1)
 *   connecté → /orders/successful-order/{hash}
 *              /orders/cancelled-order/{hash}
 * Le brouillon gelé avant redirection (readPendingPayment) est finalisé en
 * commande locale sur succès ; sur annulation, le panier est CONSERVÉ.
 */
export function PaiementRetourPage({ outcome }: { outcome: 'success' | 'cancelled' }) {
  const { t } = useI18n()
  const { hash } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { clear } = useCart()
  const [orphan, setOrphan] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    if (outcome === 'cancelled') {
      clearPendingPayment()
      return
    }
    const pending = readPendingPayment(hash)
    if (!pending) {
      // Pas de brouillon sur cet appareil (autre navigateur, lien re-visité…)
      setOrphan(true)
      return
    }
    const order = createOrder({
      customer: pending.customer,
      lines: pending.lines,
      subtotal: pending.subtotal,
      deliveryFee: pending.deliveryFee,
      discount: pending.discount,
      serverRef: params.get('ref') ?? undefined,
      paymentMethod: 'online',
      paid: true,
    })
    clearPendingPayment()
    clear()
    navigate(`/confirmation/${order.token}`, { replace: true })
  }, [outcome, hash, params, clear, navigate])

  if (outcome === 'cancelled') {
    return (
      <>
        <AppBar title={t('paiement.cancelledTitle')} />
        <Page noTabbar>
          <div className="mx-auto max-w-lg px-5 pt-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-alerte/15 grid place-items-center text-alerte">
              <Icon name="credit_card_off" size={44} />
            </div>
            <h2 className="font-title font-extrabold text-2xl mt-4">{t('paiement.cancelledTitle')}</h2>
            <p className="text-taupe mt-1">{t('paiement.cancelledHint')}</p>
            <Button full className="mt-6" onClick={() => navigate('/panier')}>{t('paiement.backToCart')}</Button>
            <Button full variant="ghost" className="mt-3" onClick={() => navigate('/')}>{t('common.viewShop')}</Button>
          </div>
        </Page>
      </>
    )
  }

  return (
    <>
      <AppBar title={t('paiement.title')} />
      <Page noTabbar>
        <div className="mx-auto max-w-lg px-5 pt-10 flex flex-col items-center text-center">
          {orphan ? (
            <>
              <div className="w-20 h-20 rounded-full bg-halal/15 grid place-items-center text-halal">
                <Icon name="check_circle" size={44} fill />
              </div>
              <h2 className="font-title font-extrabold text-2xl mt-4">{t('paiement.receivedTitle')}</h2>
              <p className="text-taupe mt-1">
                {t('paiement.receivedHint')}
              </p>
              <Button full className="mt-6" onClick={() => navigate('/commandes')}>{t('commandes.title')}</Button>
              <Button full variant="ghost" className="mt-3" onClick={() => navigate('/')}>{t('common.viewShop')}</Button>
            </>
          ) : (
            <p className="text-taupe pt-6">{t('paiement.wait')}</p>
          )}
        </div>
      </Page>
    </>
  )
}
