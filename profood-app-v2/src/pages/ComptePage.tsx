import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { listOrders } from '../lib/orders'
import { getProfile } from '../lib/profile'
import { useFavorites } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { haptic } from '../lib/haptics'

export function ComptePage() {
  const navigate = useNavigate()
  const orders = listOrders()
  const lastOrder = orders[0]
  const { count: favCount } = useFavorites()
  const { user, isAuthenticated, logout } = useAuth()
  const profile = getProfile()
  const displayName = user?.name || profile.name || 'Invité'
  const displaySub = user?.phone || profile.phone || 'Connectez-vous pour retrouver vos commandes'

  const rows: { icon: string; label: string; hint?: string; onClick?: () => void; disabled?: boolean }[] = [
    { icon: 'receipt_long', label: 'Mes commandes', hint: orders.length ? String(orders.length) : undefined, onClick: () => navigate('/commandes') },
    {
      icon: 'local_shipping',
      label: 'Suivre ma dernière commande',
      onClick: lastOrder ? () => navigate(`/suivi/${lastOrder.token}`) : undefined,
      disabled: !lastOrder,
    },
    { icon: 'favorite', label: 'Mes découpes favorites', hint: favCount ? String(favCount) : undefined, onClick: () => navigate('/favoris') },
    { icon: 'location_on', label: 'Mes adresses', hint: profile.addresses.length ? String(profile.addresses.length) : undefined, onClick: () => navigate('/adresses') },
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
            <div className="min-w-0 flex-1">
              <p className="font-title font-extrabold truncate">{displayName}</p>
              <p className="text-[13px] text-taupe truncate">{displaySub}</p>
            </div>
            {isAuthenticated && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-halal bg-halal/12 rounded-full px-2.5 py-1">
                <Icon name="verified" size={14} fill /> Connecté
              </span>
            )}
          </div>

          {!isAuthenticated && (
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={() => navigate('/connexion')}>Se connecter</Button>
              <Button variant="ghost" className="flex-1" onClick={() => navigate('/inscription')}>Créer un compte</Button>
            </div>
          )}

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

          {isAuthenticated && (
            <button
              onClick={() => { haptic('medium'); logout() }}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-card border border-sable py-3 font-title font-bold text-taupe active:bg-creme-dark active:text-alerte transition-colors"
            >
              <Icon name="logout" size={20} /> Se déconnecter
            </button>
          )}
        </div>
      </Page>
    </>
  )
}
