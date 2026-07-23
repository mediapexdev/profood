import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, changePassword, AuthError } from '../lib/auth'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-taupe">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

/** Édition du profil (prénom/nom/e-mail — téléphone non modifiable) + mot de passe. */
export function ProfilPage() {
  const { t } = useI18n()
  const { user, isAuthenticated, refresh } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  if (!isAuthenticated || !user) return <Navigate to="/connexion" replace />

  const saveProfile = async () => {
    if (profileBusy) return
    if (firstName.trim().length < 2 || lastName.trim().length < 1) {
      return setProfileMsg({ ok: false, text: t('profil.nameRequired') })
    }
    setProfileBusy(true)
    setProfileMsg(null)
    haptic('medium')
    try {
      await updateProfile({ firstName, lastName, email: email.trim() || undefined })
      refresh()
      setProfileMsg({ ok: true, text: t('profil.saved') })
    } catch (e) {
      setProfileMsg({ ok: false, text: e instanceof AuthError ? e.message : t('common.genericError') })
    } finally {
      setProfileBusy(false)
    }
  }

  const savePassword = async () => {
    if (pwBusy) return
    if (next.length < 8) return setPwMsg({ ok: false, text: t('convert.passwordTooShort') })
    if (next !== confirm) return setPwMsg({ ok: false, text: t('convert.passwordMismatch') })
    setPwBusy(true)
    setPwMsg(null)
    haptic('medium')
    try {
      await changePassword({ currentPassword: current, newPassword: next, newPasswordConfirmation: confirm })
      setCurrent(''); setNext(''); setConfirm('')
      setPwMsg({ ok: true, text: t('profil.passwordSaved') })
    } catch (e) {
      setPwMsg({ ok: false, text: e instanceof AuthError ? e.message : t('common.genericError') })
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <>
      <AppBar title={t('profil.title')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 md:pt-6 flex flex-col gap-5">
          {/* Identité */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">{t('profil.sectionIdentity')}</h2>
            <Field label={t('profil.firstName')}>
              <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label={t('profil.lastName')}>
              <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </Field>
            <Field label={t('common.phone')}>
              <div className="flex items-center gap-2">
                <input className={`${inputCls} opacity-60`} value={user.phone} disabled />
                <span title={t('profil.phoneLocked')}><Icon name="lock" size={18} className="text-taupe" /></span>
              </div>
              <span className="text-[12px] text-taupe">{t('profil.phoneLocked')}</span>
            </Field>
            <Field label={t('auth.emailOptionalLabel')}>
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} inputMode="email" autoComplete="email" />
            </Field>
            {profileMsg && (
              <p className={`text-[13px] font-semibold ${profileMsg.ok ? 'text-halal' : 'text-alerte'}`}>{profileMsg.text}</p>
            )}
            <Button full disabled={profileBusy} onClick={saveProfile}>
              {profileBusy ? t('checkout.submitting') : t('common.save')}
            </Button>
          </section>

          {/* Mot de passe */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">{t('profil.sectionPassword')}</h2>
            <Field label={t('profil.currentPassword')}>
              <input className={inputCls} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
            </Field>
            <Field label={t('profil.newPassword')}>
              <input className={inputCls} type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={t('convert.passwordPlaceholder')} autoComplete="new-password" />
            </Field>
            <Field label={t('convert.confirmPlaceholder')}>
              <input className={inputCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </Field>
            {pwMsg && (
              <p className={`text-[13px] font-semibold ${pwMsg.ok ? 'text-halal' : 'text-alerte'}`}>{pwMsg.text}</p>
            )}
            <Button full variant="ghost" disabled={pwBusy || !current || !next} onClick={savePassword}>
              {pwBusy ? t('checkout.submitting') : t('profil.changePasswordCta')}
            </Button>
          </section>
        </div>
      </Page>
    </>
  )
}
