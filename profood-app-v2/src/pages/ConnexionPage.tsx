import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { AuthError } from '../lib/auth'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

export function ConnexionPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const flash = location.state as { justRegistered?: boolean; passwordReset?: boolean } | null
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return
    setError('')
    if (phone.trim().length < 6 || password.length < 1) {
      setError(t('auth.signInFieldsRequired'))
      return
    }
    setBusy(true)
    try {
      await login(phone, password)
      haptic('medium')
      navigate('/compte', { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e.message : t('auth.signInError'))
      setBusy(false)
    }
  }

  return (
    <>
      <AppBar title={t('auth.signInTitle')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">{t('auth.welcomeBack')}</h2>
          <p className="text-taupe text-[14px] mt-1">{t('auth.signInSubtitle')}</p>

          {(flash?.justRegistered || flash?.passwordReset) && (
            <p className="mt-3 rounded-xl bg-halal/12 text-halal text-[13px] font-semibold px-3.5 py-2.5">
              {flash.justRegistered ? t('auth.justRegistered') : t('auth.passwordChanged')}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3.5">
            <label className="block">
              <span className="text-[13px] font-bold text-taupe">{t('common.phone')}</span>
              <input className={`${inputCls} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('common.phonePlaceholder')} inputMode="tel" autoComplete="tel" />
            </label>
            <label className="block">
              <span className="text-[13px] font-bold text-taupe">{t('auth.passwordLabel')}</span>
              <input className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.passwordPlaceholder')} autoComplete="current-password"
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
            </label>

            {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}

            <Button full disabled={busy} className="mt-1" onClick={submit}>{busy ? t('auth.signInBusy') : t('account.signIn')}</Button>

            <Link to="/mot-de-passe-oublie" className="text-center text-[13px] font-bold text-taupe active:text-terre">{t('auth.forgotPassword')}</Link>

            <div className="filet w-full my-2" />
            <p className="text-center text-[14px] text-taupe">
              {t('auth.noAccount')}{' '}
              <Link to="/inscription" className="font-bold text-terre">{t('account.signUp')}</Link>
            </p>
          </div>
        </div>
      </Page>
    </>
  )
}
