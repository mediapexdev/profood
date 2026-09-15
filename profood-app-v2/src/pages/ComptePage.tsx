import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/shell/Sheet'
import { AuthError } from '../lib/auth'
import { listOrders } from '../lib/orders'
import { getProfile } from '../lib/profile'
import { useFavorites } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { haptic } from '../lib/haptics'
import { whatsappUrl } from '../lib/contact'

export function ComptePage() {
  const navigate = useNavigate()
  const orders = listOrders()
  const lastOrder = orders[0]
  const { count: favCount } = useFavorites()
  const { user, isAuthenticated, logout, deleteAccount } = useAuth()
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
    ...(isAuthenticated
      ? [{ icon: 'manage_accounts', label: t('account.editProfile'), onClick: () => navigate('/profil') }]
      : []),
    { icon: 'help', label: t('account.help'), hint: 'WhatsApp', onClick: () => window.open(whatsappUrl(), '_blank', 'noopener') },
    { icon: 'privacy_tip', label: t('account.privacy'), onClick: () => navigate('/confidentialite') },
  ]

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)

  const closeDelete = () => {
    if (deleteBusy) return
    setDeleteOpen(false)
    setDeletePassword('')
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (deleteBusy || !deletePassword) return
    setDeleteBusy(true)
    setDeleteError(null)
    haptic('medium')
    try {
      await deleteAccount(deletePassword)
      setDeleteOpen(false)
      setDeletePassword('')
      setDeleted(true)
    } catch (e) {
      setDeleteError(e instanceof AuthError ? e.message : t('common.genericError'))
    } finally {
      setDeleteBusy(false)
    }
  }

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

          {deleted && (
            <p role="status" className="mt-3 flex items-center gap-2 bg-surface border border-sable rounded-card p-4 text-[14px] font-semibold text-halal">
              <Icon name="check_circle" size={20} fill /> {t('account.deleted')}
            </p>
          )}

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

          {isAuthenticated && (
            <button
              onClick={() => { haptic('light'); setDeleteOpen(true) }}
              className="w-full mt-2 py-3 text-[13px] font-semibold text-taupe underline underline-offset-2 active:text-alerte transition-colors"
            >
              {t('account.delete')}
            </button>
          )}
        </div>
      </Page>

      <Sheet open={deleteOpen} onClose={closeDelete} title={t('account.deleteTitle')}>
        <div className="flex flex-col gap-3.5 pb-4">
          <p className="text-[14px] text-taupe">{t('account.deleteWarning')}</p>
          <label className="block">
            <span className="text-[13px] font-bold text-taupe">{t('account.deletePasswordLabel')}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="mt-1 w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors"
            />
          </label>
          {deleteError && <p role="alert" className="text-[13px] font-semibold text-alerte">{deleteError}</p>}
          <Button full variant="danger" disabled={deleteBusy || !deletePassword} onClick={confirmDelete}>
            {deleteBusy ? t('account.deleteBusy') : t('account.deleteConfirm')}
          </Button>
          <Button full variant="ghost" disabled={deleteBusy} onClick={closeDelete}>
            {t('account.deleteCancel')}
          </Button>
        </div>
      </Sheet>
    </>
  )
}
