import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { getOrder, currentStage, isCancelled, patchOrder, stageTime, estimatedDelivery, STAGES } from '../lib/orders'
import { useServerOrders } from '../lib/useServerOrders'
import { cancelOrder, ordersApiEnabled, OrderApiError } from '../api/orders'
import { currentToken } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

export function SuiviPage() {
  const { t, locale } = useI18n()
  const hhmm = (ms: number) => new Date(ms).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, mode } = useAuth()
  // Reporte le statut réel du serveur sur la commande locale (si connecté).
  useServerOrders()
  const order = getOrder(token)

  // Annulation en deux temps (pas de confirm() bloquant) : armer puis confirmer.
  const [cancelArmed, setCancelArmed] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [, bump] = useState(0)

  // Tic régulier : la chronologie « avance » sous les yeux du client.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  if (!order) {
    return (
      <>
        <AppBar title={t('suivi.notFoundTitle')} back />
        <Page noTabbar><p className="p-6 text-taupe">{t('common.orderNotFound')}</p></Page>
      </>
    )
  }

  const stage = currentStage(order, now)
  const cancelled = isCancelled(order)
  const activeIdx = STAGES.findIndex((s) => s.key === stage)
  const delivered = stage === 'delivered'

  // Annulable : uniquement au stade « reçue » (règle v1 — le serveur, lui,
  // ne borne pas), commande serveur connue, session API réelle (le serveur
  // vérifie la propriété).
  const apiToken = currentToken()
  const canCancel =
    ordersApiEnabled && !cancelled && stage === 'received'
    && !!order.serverId && mode === 'api' && isAuthenticated
    && !!apiToken && !apiToken.startsWith('local:') && !!user?.id

  const doCancel = async () => {
    if (!canCancel || cancelling) return
    if (!cancelArmed) {
      haptic('light')
      setCancelArmed(true)
      return
    }
    setCancelling(true)
    setCancelError('')
    haptic('medium')
    try {
      await cancelOrder(user!.id!, apiToken!, order.serverId!)
      patchOrder(order.token, { serverStage: 'cancelled' })
      setCancelArmed(false)
      bump((v) => v + 1)
    } catch (e) {
      setCancelError(e instanceof OrderApiError ? e.message : t('common.genericError'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <AppBar title={t('suivi.title')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-lg px-4 md:px-6 pt-4 flex flex-col gap-5">
          {/* Bandeau état */}
          {cancelled ? (
            <div className="bg-alerte/10 border border-alerte/30 rounded-card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-alerte text-white grid place-items-center shrink-0">
                <Icon name="cancel" size={26} fill />
              </div>
              <div className="min-w-0">
                <p className="font-title font-extrabold text-lg leading-tight">{t('suivi.cancelledTitle')}</p>
                <p className="text-[13px] text-taupe">{t('suivi.cancelledHint', { refund: order.paid ? t('suivi.refundInProgress') : '' })}</p>
              </div>
              <span className="ml-auto text-[11px] font-bold tabular-nums text-taupe">{order.ref}</span>
            </div>
          ) : (
          <div className="bg-terre/10 border border-terre/30 rounded-card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-terre text-white grid place-items-center shrink-0">
              <Icon name={STAGES[activeIdx].icon} size={26} fill />
            </div>
            <div className="min-w-0">
              <p className="font-title font-extrabold text-lg leading-tight">{t(STAGES[activeIdx].labelKey)}</p>
              <p className="text-[13px] text-taupe">
                {delivered ? t('suivi.deliveredTo', { commune: order.customer.commune }) : t('suivi.estimatedAround', { time: estimatedDelivery(order) })}
              </p>
            </div>
            <span className="ml-auto text-[11px] font-bold tabular-nums text-taupe">{order.ref}</span>
          </div>
          )}

          {/* Chronologie 4 états */}
          {!cancelled && (
          <div className="bg-surface border border-sable rounded-card p-4">
            <ol className="relative">
              {STAGES.map((s, i) => {
                const done = i <= activeIdx
                const isCurrent = i === activeIdx
                const reached = stageTime(order, s.key)
                return (
                  <li key={s.key} className="relative flex gap-3.5 pb-6 last:pb-0">
                    {i < STAGES.length - 1 && (
                      <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-sable">
                        {i < activeIdx && (
                          <span
                            className="timeline-grow absolute inset-0 bg-terre"
                            style={{ animationDelay: `${200 + i * 320}ms` }}
                          />
                        )}
                      </span>
                    )}
                    <span
                      className={`relative z-10 w-8 h-8 shrink-0 rounded-full grid place-items-center border-2 transition-colors ${done ? 'bg-terre border-terre text-white animate-pop' : 'bg-surface border-sable text-taupe'}`}
                      style={done ? { animationDelay: `${i * 320}ms` } : undefined}
                    >
                      {isCurrent && !delivered && (
                        <span className="absolute inset-0 rounded-full bg-terre/60 animate-ping [animation-duration:1.9s]" aria-hidden />
                      )}
                      <Icon name={done ? s.icon : 'radio_button_unchecked'} size={done ? 18 : 16} fill={done} />
                    </span>
                    <div className="pt-1">
                      <p className={`font-title font-bold text-[15px] ${done ? 'text-ink' : 'text-taupe'}`}>{t(s.labelKey)}</p>
                      <p className="text-[12px] text-taupe tabular-nums">
                        {done ? hhmm(reached) : t('suivi.estimatedShort', { time: hhmm(reached) })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
          )}

          {/* Preuve de livraison (à venir : photo/checklist du livreur) */}
          {delivered && !cancelled && (
            <div className="bg-halal/10 border border-halal/30 rounded-card p-4 flex items-center gap-3">
              <Icon name="verified" size={26} className="text-halal" fill />
              <p className="text-[13px] text-ink">{t('suivi.deliveredMessage')}</p>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="bg-surface border border-sable rounded-card p-4">
            <h2 className="font-title font-extrabold mb-3">{t('suivi.orderHeading')}</h2>
            <div className="flex flex-col gap-2.5">
              {order.lines.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={l.image} alt={l.name} className="w-11 h-11 rounded-lg object-cover bg-creme shrink-0" />
                  <span className="flex-1 text-[14px] truncate">{l.name}</span>
                  <span className="text-[13px] text-taupe tabular-nums">×{l.qty}</span>
                  <span className="text-[14px] font-semibold tabular-nums">{fmtFcfa(l.unitPrice * l.qty)}</span>
                </div>
              ))}
            </div>
            <div className="filet w-full my-3" />
            <div className="flex justify-between text-[13px]"><span className="text-taupe">{t('common.subtotal')}</span><span className="tabular-nums">{fmtFcfa(order.subtotal)}</span></div>
            <div className="flex justify-between text-[13px] mt-1"><span className="text-taupe">{t('common.delivery')}</span><span className="tabular-nums">{order.deliveryFee === 0 ? t('common.free') : fmtFcfa(order.deliveryFee)}</span></div>
            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between text-[13px] mt-1 text-halal"><span>{t('promo.discount')}</span><span className="tabular-nums">-{fmtFcfa(order.discount!)}</span></div>
            )}
            <div className="flex justify-between mt-2"><span className="font-title font-extrabold">{t('common.total')}</span><span className="font-title font-extrabold tabular-nums">{fmtFcfa(order.total)}</span></div>
          </div>

          {/* Annulation (client connecté, avant départ en livraison) */}
          {canCancel && (
            <div className="flex flex-col gap-2">
              <button
                onClick={doCancel}
                disabled={cancelling}
                className={`w-full flex items-center justify-center gap-2 rounded-card border py-3 font-title font-bold transition-colors ${cancelArmed ? 'border-alerte bg-alerte/10 text-alerte' : 'border-sable text-taupe active:bg-creme-dark'}`}
              >
                <Icon name="cancel" size={20} />
                {cancelling ? t('checkout.submitting') : cancelArmed ? t('suivi.cancelConfirm') : t('suivi.cancelCta')}
              </button>
              {cancelArmed && !cancelling && (
                <button onClick={() => setCancelArmed(false)} className="text-[13px] font-bold text-taupe">
                  {t('suivi.cancelKeep')}
                </button>
              )}
              {cancelError && <p className="text-[13px] font-semibold text-alerte text-center">{cancelError}</p>}
            </div>
          )}

          <Button full variant="ghost" className="mb-2" onClick={() => navigate('/boutique')}>{t('suivi.backToShop')}</Button>
        </div>
      </Page>
    </>
  )
}
