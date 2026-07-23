import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { getOrder, estimatedDelivery } from '../lib/orders'
import { ordersApiEnabled } from '../api/orders'
import { convertGuestOrder, AuthError } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

/**
 * Carte « créer un compte » après une commande invitée (convert-guest-order) :
 * le téléphone vient de la commande côté serveur, il ne reste que le mot de
 * passe. Toutes les commandes invitées au même numéro sont rattachées.
 */
function ConvertCard({ orderRef }: { orderRef: string }) {
  const { t } = useI18n()
  const { refresh } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (busy) return
    if (password.length < 8) return setError(t('convert.passwordTooShort'))
    if (password !== confirm) return setError(t('convert.passwordMismatch'))
    setBusy(true)
    setError('')
    haptic('medium')
    try {
      await convertGuestOrder({ orderRef, password, passwordConfirmation: confirm })
      refresh()
      window.dispatchEvent(new CustomEvent('auth:login'))
      setDone(true)
    } catch (e) {
      setError(e instanceof AuthError ? e.message : t('common.genericError'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="w-full bg-halal/10 border border-halal/30 rounded-card p-4 mt-4 flex items-center gap-3 text-left">
        <Icon name="verified" size={24} className="text-halal" fill />
        <p className="text-[14px] text-ink">{t('convert.done')}</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-surface border border-sable rounded-card p-4 mt-4 text-left">
      <p className="font-title font-extrabold">{t('convert.title')}</p>
      <p className="text-[13px] text-taupe mt-0.5">{t('convert.hint')}</p>
      <div className="flex flex-col gap-2.5 mt-3">
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={t('convert.passwordPlaceholder')} autoComplete="new-password" />
        <input className={inputCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder={t('convert.confirmPlaceholder')} autoComplete="new-password" />
        {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
        <Button full disabled={busy} onClick={submit}>
          {busy ? t('checkout.submitting') : t('convert.cta')}
        </Button>
      </div>
    </div>
  )
}

export function ConfirmationPage() {
  const { t } = useI18n()
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, mode } = useAuth()
  const order = getOrder(token)
  // Figé à l'arrivée : la carte de conversion reste montée après le succès
  // (sinon isAuthenticated bascule et le message « compte créé » disparaît).
  const [showConvert] = useState(() => ordersApiEnabled && mode === 'api' && !isAuthenticated)

  if (!order) {
    return (
      <>
        <AppBar title={t('confirmation.notFoundTitle')} back />
        <Page noTabbar><p className="p-6 text-taupe">{t('common.orderNotFound')}</p></Page>
      </>
    )
  }

  return (
    <>
      <AppBar title={t('confirmation.title')} />
      <Page noTabbar>
        <div className="mx-auto max-w-lg px-5 md:px-6 pt-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-halal/15 grid place-items-center text-halal animate-pop">
            <Icon name="check_circle" size={52} fill />
          </div>
          <h2 className="font-title font-extrabold text-2xl mt-4">{t('confirmation.thanks', { name: order.customer.name.split(' ')[0] })}</h2>
          <p className="text-taupe mt-1">{t('confirmation.received')}</p>

          <div className="w-full bg-surface border border-sable rounded-card p-4 mt-6 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-taupe">{t('confirmation.reference')}</span>
              <span className="font-title font-bold tabular-nums">{order.ref}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[13px] text-taupe">{t('confirmation.estimatedDelivery')}</span>
              <span className="font-bold">~ {estimatedDelivery(order)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[13px] text-taupe">{t('common.total')}</span>
              <span className="font-title font-extrabold tabular-nums">{fmtFcfa(order.total)}</span>
            </div>
            <div className="filet w-full my-3" />
            <p className="text-[13px] text-taupe">
              {t('confirmation.deliveryToPrefix')} <span className="text-ink font-semibold">{order.customer.commune}</span>
              {order.paymentMethod === 'online' && order.paid ? t('confirmation.paidOnline') : t('confirmation.payOnDelivery')}
            </p>
          </div>

          {showConvert && order.serverRef && <ConvertCard orderRef={order.serverRef} />}

          <Button full className="mt-6" onClick={() => navigate(`/suivi/${order.token}`)}>
            <Icon name="local_shipping" size={20} /> {t('confirmation.trackOrder')}
          </Button>
          <Button full variant="ghost" className="mt-3" onClick={() => navigate('/')}>{t('confirmation.continueShopping')}</Button>
        </div>
      </Page>
    </>
  )
}
