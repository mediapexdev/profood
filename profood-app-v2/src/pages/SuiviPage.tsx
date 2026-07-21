import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { getOrder, currentStage, stageTime, estimatedDelivery, STAGES } from '../lib/orders'
import { fmtFcfa } from '../lib/format'

const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function SuiviPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const order = getOrder(token)

  // Tic régulier : la chronologie « avance » sous les yeux du client.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  if (!order) {
    return (
      <>
        <AppBar title="Suivi" back />
        <Page noTabbar><p className="p-6 text-taupe">Commande introuvable.</p></Page>
      </>
    )
  }

  const stage = currentStage(order, now)
  const activeIdx = STAGES.findIndex((s) => s.key === stage)
  const delivered = stage === 'delivered'

  return (
    <>
      <AppBar title="Suivi de commande" back />
      <Page noTabbar>
        <div className="mx-auto max-w-lg px-4 md:px-6 pt-4 flex flex-col gap-5">
          {/* Bandeau état */}
          <div className="bg-terre/10 border border-terre/30 rounded-card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-terre text-white grid place-items-center shrink-0">
              <Icon name={STAGES[activeIdx].icon} size={26} fill />
            </div>
            <div className="min-w-0">
              <p className="font-title font-extrabold text-lg leading-tight">{STAGES[activeIdx].label}</p>
              <p className="text-[13px] text-taupe">
                {delivered ? `Livrée à ${order.customer.commune}` : `Livraison estimée ~ ${estimatedDelivery(order)}`}
              </p>
            </div>
            <span className="ml-auto text-[11px] font-bold tabular-nums text-taupe">{order.ref}</span>
          </div>

          {/* Chronologie 4 états */}
          <div className="bg-surface border border-sable rounded-card p-4">
            <ol className="relative">
              {STAGES.map((s, i) => {
                const done = i <= activeIdx
                const isCurrent = i === activeIdx
                const reached = stageTime(order, s.key)
                return (
                  <li key={s.key} className="relative flex gap-3.5 pb-6 last:pb-0">
                    {i < STAGES.length - 1 && (
                      <span className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${i < activeIdx ? 'bg-terre' : 'bg-sable'}`} />
                    )}
                    <span className={`relative z-10 w-8 h-8 shrink-0 rounded-full grid place-items-center border-2 transition-colors ${done ? 'bg-terre border-terre text-white' : 'bg-surface border-sable text-taupe'} ${isCurrent && !delivered ? 'animate-pop' : ''}`}>
                      <Icon name={done ? s.icon : 'radio_button_unchecked'} size={done ? 18 : 16} fill={done} />
                    </span>
                    <div className="pt-1">
                      <p className={`font-title font-bold text-[15px] ${done ? 'text-ink' : 'text-taupe'}`}>{s.label}</p>
                      <p className="text-[12px] text-taupe tabular-nums">
                        {done ? hhmm(reached) : `estimé ~ ${hhmm(reached)}`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Preuve de livraison (à venir : photo/checklist du livreur) */}
          {delivered && (
            <div className="bg-halal/10 border border-halal/30 rounded-card p-4 flex items-center gap-3">
              <Icon name="verified" size={26} className="text-halal" fill />
              <p className="text-[13px] text-ink">Commande livrée. Merci de votre confiance !</p>
            </div>
          )}

          {/* Récapitulatif */}
          <div className="bg-surface border border-sable rounded-card p-4">
            <h2 className="font-title font-extrabold mb-3">Votre commande</h2>
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
            <div className="flex justify-between text-[13px]"><span className="text-taupe">Sous-total</span><span className="tabular-nums">{fmtFcfa(order.subtotal)}</span></div>
            <div className="flex justify-between text-[13px] mt-1"><span className="text-taupe">Livraison</span><span className="tabular-nums">{order.deliveryFee === 0 ? 'Offerte' : fmtFcfa(order.deliveryFee)}</span></div>
            <div className="flex justify-between mt-2"><span className="font-title font-extrabold">Total</span><span className="font-title font-extrabold tabular-nums">{fmtFcfa(order.total)}</span></div>
          </div>

          <Button full variant="ghost" className="mb-2" onClick={() => navigate('/')}>Retour à la boutique</Button>
        </div>
      </Page>
    </>
  )
}
