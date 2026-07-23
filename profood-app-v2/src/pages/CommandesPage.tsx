import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { listOrders, currentStage, isCancelled, STAGES } from '../lib/orders'
import { useServerOrders } from '../lib/useServerOrders'
import { fmtFcfa } from '../lib/format'
import { useI18n } from '../i18n'

function StageBadge({ stage, cancelled }: { stage: (typeof STAGES)[number]['key']; cancelled: boolean }) {
  const { t } = useI18n()
  if (cancelled) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-alerte/15 text-alerte">
        <Icon name="cancel" size={14} fill /> {t('order.cancelled')}
      </span>
    )
  }
  const s = STAGES.find((x) => x.key === stage)!
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${stage === 'delivered' ? 'bg-halal/15 text-halal' : 'bg-terre/15 text-terre-deep'}`}>
      <Icon name={s.icon} size={14} fill /> {t(s.labelKey)}
    </span>
  )
}

export function CommandesPage() {
  const { t, locale } = useI18n()
  const dateFr = (ms: number) =>
    new Date(ms).toLocaleDateString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const navigate = useNavigate()
  // Statut réel (client connecté) + commandes passées depuis un autre appareil.
  const { serverOnly, version } = useServerOrders()
  const orders = useMemo(() => listOrders(), [version])

  const empty = orders.length === 0 && serverOnly.length === 0

  return (
    <>
      <AppBar title={t('commandes.title')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-4 flex flex-col gap-3">
          {empty ? (
            <div className="flex flex-col items-center text-center gap-3 pt-20 text-taupe">
              <span className="opacity-40"><Icon name="receipt_long" size={54} /></span>
              <p className="font-title font-extrabold text-lg text-ink">{t('commandes.emptyTitle')}</p>
              <p className="text-[14px]">{t('commandes.emptyHint')}</p>
              <Button className="mt-2" onClick={() => navigate('/')}>{t('common.viewShop')}</Button>
            </div>
          ) : (
            <>
              {orders.map((o) => {
                const stage = currentStage(o)
                return (
                  <button
                    key={o.token}
                    onClick={() => navigate(`/suivi/${o.token}`)}
                    className="text-left bg-surface border border-sable rounded-card p-4 active:bg-creme-dark transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-title font-bold tabular-nums">{o.ref}</span>
                      <StageBadge stage={stage} cancelled={isCancelled(o)} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[13px] text-taupe">
                      <span>{dateFr(o.createdAt)} · {t('cart.items', { count: o.lines.reduce((n, l) => n + l.qty, 0) })}</span>
                      <span className="font-title font-extrabold text-ink tabular-nums">{fmtFcfa(o.total)}</span>
                    </div>
                  </button>
                )
              })}
              {/* Commandes retrouvées côté serveur (autre appareil / app v1). */}
              {serverOnly.map((o) => (
                <div key={o.serverRef} className="bg-surface border border-sable rounded-card p-4 opacity-90">
                  <div className="flex items-center justify-between">
                    <span className="font-title font-bold tabular-nums">{o.serverRef}</span>
                    <StageBadge stage={o.stage === 'cancelled' ? 'received' : o.stage} cancelled={o.stage === 'cancelled'} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[13px] text-taupe">
                    <span>{dateFr(o.createdAt)} · {t('commandes.otherDevice')}</span>
                    <span className="font-title font-extrabold text-ink tabular-nums">{fmtFcfa(o.montant)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Page>
    </>
  )
}
