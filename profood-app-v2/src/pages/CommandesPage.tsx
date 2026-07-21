import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { listOrders, currentStage, STAGES } from '../lib/orders'
import { fmtFcfa } from '../lib/format'

const dateFr = (ms: number) =>
  new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function CommandesPage() {
  const navigate = useNavigate()
  const orders = listOrders()

  return (
    <>
      <AppBar title="Mes commandes" back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-4 flex flex-col gap-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 pt-20 text-taupe">
              <span className="opacity-40"><Icon name="receipt_long" size={54} /></span>
              <p className="font-title font-extrabold text-lg text-ink">Aucune commande</p>
              <p className="text-[14px]">Vos commandes passées apparaîtront ici.</p>
              <Button className="mt-2" onClick={() => navigate('/')}>Voir la boutique</Button>
            </div>
          ) : (
            orders.map((o) => {
              const stage = currentStage(o)
              const s = STAGES.find((x) => x.key === stage)!
              return (
                <button
                  key={o.token}
                  onClick={() => navigate(`/suivi/${o.token}`)}
                  className="text-left bg-surface border border-sable rounded-card p-4 active:bg-creme-dark transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-title font-bold tabular-nums">{o.ref}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${stage === 'delivered' ? 'bg-halal/15 text-halal' : 'bg-terre/15 text-terre-deep'}`}>
                      <Icon name={s.icon} size={14} fill /> {s.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[13px] text-taupe">
                    <span>{dateFr(o.createdAt)} · {o.lines.reduce((n, l) => n + l.qty, 0)} article(s)</span>
                    <span className="font-title font-extrabold text-ink tabular-nums">{fmtFcfa(o.total)}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </Page>
    </>
  )
}
