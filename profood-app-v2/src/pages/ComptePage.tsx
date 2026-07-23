import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { listOrders } from '../lib/orders'
import { getProfile } from '../lib/profile'
import { useFavorites } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { haptic } from '../lib/haptics'

export function ComptePage() {
  const navigate = useNavigate()
  const orders = listOrders()
  const lastOrder = orders[0]
  const { count: favCount } = useFavorites()
  const { user, isAuthenticated, logout } = useAuth()
  const { t, lang, setLang } = useI18n()
  const profile = getProfile()
  const displayName = user?.name || profile.name || t('account.guest')
  const displaySub = user?.phone || profile.phone || t('account.guestHint')

  const rows: { icon: string; label: string; hint?: string; onClick?: () => void; disabled?: boolean }[] = [
    { icon: 'receipt_long', label: t('account.orders'), hint: orders.length ? String(orders.length) : undefined, onClick: () => navigate('/commandes') },
    {
      icon: 'local_shipping',
      label: t('account.trackLast'),
      onClick: lastOrder ? () => navigate(`/suivi/${lastOrder.token}`) : undefined,
      disabled: !lastOrder,
    },
    { icon: 'favorite', label: t('account.favorites'), hint: favCount ? String(favCount) : undefined, onClick: () => navigate('/favoris') },
    { icon: 'location_on', label: t('account.addresses'), hint: profile.addresses.length ? String(profile.addresses.length) : undefined, onClick: () => navigate('/adresses') },
    { icon: 'help', label: t('account.help'), disabled: true },
  ]

  const pickLang = (l: Lang) => {
    if (l === lang) return
    haptic('light')
    setLang(l)
  }

  return (
    <>
      <AppBar title={t('account.title')} />
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
                <Icon name="verified" size={14} fill /> {t('account.connected')}
              </span>
            )}
          </div>

          {!isAuthenticated && (
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={() => navigate('/connexion')}>{t('account.signIn')}</Button>
              <Button variant="ghost" className="flex-1" onClick={() => navigate('/inscription')}>{t('account.signUp')}</Button>
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
            {/* Langue — FR par défaut, EN conservé (décision projet) */}
            <div className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-sable">
              <Icon name="language" size={22} className="text-taupe" />
              <span className="flex-1 font-semibold text-[15px]">{t('account.language')}</span>
              <div className="inline-flex rounded-full border-[1.5px] border-sable overflow-hidden">
                {(['fr', 'en'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => pickLang(l)}
                    aria-pressed={lang === l}
                    className={`px-3 py-1 text-[12px] font-bold uppercase transition-colors ${lang === l ? 'bg-terre text-white' : 'text-taupe'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => { haptic('medium'); logout() }}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-card border border-sable py-3 font-title font-bold text-taupe active:bg-creme-dark active:text-alerte transition-colors"
            >
              <Icon name="logout" size={20} /> {t('account.signOut')}
            </button>
          )}
        </div>
      </Page>
    </>
  )
}
