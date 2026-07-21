import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Icon } from '../components/ui/Icon'
import { listOrders } from '../lib/orders'
import { useFavorites } from '../contexts/FavoritesContext'
import { haptic } from '../lib/haptics'

export function ComptePage() {
  const navigate = useNavigate()
  const orders = listOrders()
  const lastOrder = orders[0]
  const { count: favCount } = useFavorites()

  const rows: { icon: string; label: string; hint?: string; onClick?: () => void; disabled?: boolean }[] = [
    { icon: 'receipt_long', label: 'Mes commandes', hint: orders.length ? String(orders.length) : undefined, onClick: () => navigate('/commandes') },
    {
      icon: 'local_shipping',
      label: 'Suivre ma dernière commande',
      onClick: lastOrder ? () => navigate(`/suivi/${lastOrder.token}`) : undefined,
      disabled: !lastOrder,
    },
    { icon: 'favorite', label: 'Mes découpes favorites', hint: favCount ? String(favCount) : undefined, onClick: () => navigate('/favoris') },
    { icon: 'location_on', label: 'Mes adresses', disabled: true },
    { icon: 'help', label: 'Aide & contact', disabled: true },
  ]

  return (
    <>
      <AppBar title="Mon compte" />
      <Page>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-4">
          <div className="flex items-center gap-3 bg-surface border border-sable rounded-card p-4">
            <div className="w-12 h-12 rounded-full bg-terre/15 grid place-items-center text-terre">
              <Icon name="person" size={28} fill />
            </div>
            <div>
              <p className="font-title font-extrabold">Invité</p>
              <p className="text-[13px] text-taupe">Connectez-vous pour retrouver vos commandes</p>
            </div>
          </div>

          <div className="mt-4 bg-surface border border-sable rounded-card overflow-hidden">
            {rows.map((r, i) => (
              <button
                key={r.label}
                disabled={r.disabled}
                onClick={() => { if (r.disabled || !r.onClick) return; haptic('light'); r.onClick() }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${r.disabled ? 'opacity-40' : 'active:bg-creme-dark'} ${i ? 'border-t border-sable' : ''}`}
              >
                <Icon name={r.icon} size={22} className="text-taupe" />
                <span className="flex-1 font-semibold text-[15px]">{r.label}</span>
                {r.hint && <span className="text-[12px] font-bold text-taupe tabular-nums bg-creme-dark rounded-full px-2 py-0.5">{r.hint}</span>}
                {!r.disabled && <Icon name="chevron_right" size={20} className="text-taupe" />}
              </button>
            ))}
          </div>
        </div>
      </Page>
    </>
  )
}
