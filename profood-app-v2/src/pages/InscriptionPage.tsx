import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { AuthError, requestSignupCode, verifyCode, completeSignup } from '../lib/auth'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

const isValidPhone = (v: string) => /^7\d{8}$/.test(v.replace(/[^\d]/g, '').replace(/^221/, ''))
const isValidEmail = (v: string) => v.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

type Step = 'form' | 'otp' | 'password'

export function InscriptionPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { mode, register } = useAuth()
  const isLocal = mode === 'local'

  // En local, un seul écran (form + mot de passe). En API, 3 étapes (OTP SMS).
  const [step, setStep] = useState<Step>('form')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setError('')
    setBusy(true)
    try {
      await fn()
      haptic('medium')
    } catch (e) {
      setError(e instanceof AuthError ? e.message : t('common.genericError'))
    } finally {
      setBusy(false)
    }
  }

  const identityErrors = {
    firstName: firstName.trim().length < 2 ? t('auth.errorFirstName') : '',
    lastName: lastName.trim().length < 2 ? t('auth.errorNameRequired') : '',
    phone: !isValidPhone(phone) ? t('auth.phoneInvalid') : '',
    email: !isValidEmail(email) ? t('auth.emailInvalid') : '',
  }
  const pwdErrors = {
    password: password.length < 6 ? t('auth.errorPasswordMin') : '',
    confirm: confirm !== password ? t('auth.errorPasswordMatch') : '',
  }

  // Mode local : tout en un écran → compte créé et connecté.
  const submitLocal = () => {
    setTouched(true)
    if (Object.values(identityErrors).some(Boolean) || Object.values(pwdErrors).some(Boolean)) return
    run(async () => {
      await register({ firstName, lastName, email: email || undefined, phone, password })
      navigate('/compte', { replace: true })
    })
  }

  // Mode API — étape 1 : coordonnées → envoi du code SMS
  const submitForm = () => {
    setTouched(true)
    if (Object.values(identityErrors).some(Boolean)) return
    run(async () => {
      await requestSignupCode({ firstName, lastName, email: email || undefined, phone })
      setStep('otp'); setTouched(false)
    })
  }
  const submitOtp = () => {
    if (code.trim().length < 4) { setError(t('auth.errorOtpRequired')); return }
    run(async () => { await verifyCode(phone, code.trim(), 'REGISTRATION'); setStep('password') })
  }
  const submitPassword = () => {
    setTouched(true)
    if (Object.values(pwdErrors).some(Boolean)) return
    run(async () => {
      await completeSignup({ firstName, lastName, email: email || undefined, phone, code: code.trim(), password, passwordConfirmation: confirm })
      navigate('/connexion', { replace: true, state: { justRegistered: true } })
    })
  }

  const field = (
    label: string, value: string, set: (v: string) => void, err: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="block">
      <span className="text-[13px] font-bold text-taupe">{label}</span>
      <input className={`${inputCls} mt-1`} value={value} onChange={(e) => set(e.target.value)} {...props} />
      {touched && err && <span className="text-[12px] font-semibold text-alerte">{err}</span>}
    </label>
  )

  const identityFields = (
    <>
      {field(t('auth.firstNameLabel'), firstName, setFirstName, identityErrors.firstName, { placeholder: t('auth.firstNamePlaceholder'), autoComplete: 'given-name' })}
      {field(t('auth.lastNameLabel'), lastName, setLastName, identityErrors.lastName, { placeholder: t('auth.lastNamePlaceholder'), autoComplete: 'family-name' })}
      {field(t('common.phone'), phone, setPhone, identityErrors.phone, { placeholder: t('common.phonePlaceholder'), inputMode: 'tel', autoComplete: 'tel' })}
      {field(t('auth.emailOptionalLabel'), email, setEmail, identityErrors.email, { placeholder: t('auth.emailPlaceholder'), inputMode: 'email', autoComplete: 'email' })}
    </>
  )
  const passwordFields = (
    <>
      {field(t('auth.passwordLabel'), password, setPassword, pwdErrors.password, { type: 'password', placeholder: t('auth.passwordPlaceholder'), autoComplete: 'new-password' })}
      {field(t('auth.confirmPasswordLabel'), confirm, setConfirm, pwdErrors.confirm, { type: 'password', placeholder: t('auth.passwordPlaceholder'), autoComplete: 'new-password' })}
    </>
  )

  return (
    <>
      <AppBar title={t('account.signUp')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">{t('auth.joinTitle')}</h2>
          <p className="text-taupe text-[14px] mt-1">
            {isLocal && t('auth.signUpSubtitle')}
            {!isLocal && step === 'form' && t('auth.signUpSubtitle')}
            {!isLocal && step === 'otp' && t('auth.otpSentTo', { phone })}
            {!isLocal && step === 'password' && t('auth.choosePassword')}
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            {isLocal && (
              <>
                {identityFields}
                {passwordFields}
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitLocal}>{busy ? t('auth.creating') : t('account.signUp')}</Button>
              </>
            )}

            {!isLocal && step === 'form' && (
              <>
                {identityFields}
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitForm}>{busy ? t('auth.sending') : t('auth.receiveCode')}</Button>
              </>
            )}
            {!isLocal && step === 'otp' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">{t('auth.otpLabel')}</span>
                  <input className={`${inputCls} mt-1 text-center tracking-[0.5em] text-xl font-bold`} value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    inputMode="numeric" autoComplete="one-time-code" placeholder="••••••"
                    onKeyDown={(e) => { if (e.key === 'Enter') submitOtp() }} />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitOtp}>{busy ? t('auth.verifying') : t('auth.verify')}</Button>
                <button onClick={() => { setStep('form'); setError('') }} className="text-center text-[13px] font-bold text-taupe active:text-terre">{t('auth.editInfo')}</button>
              </>
            )}
            {!isLocal && step === 'password' && (
              <>
                {passwordFields}
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitPassword}>{busy ? t('auth.creating') : t('account.signUp')}</Button>
              </>
            )}

            <div className="filet w-full my-2" />
            <p className="text-center text-[14px] text-taupe">
              {t('auth.hasAccount')} <Link to="/connexion" className="font-bold text-terre">{t('account.signIn')}</Link>
            </p>
          </div>
        </div>
      </Page>
    </>
  )
}
