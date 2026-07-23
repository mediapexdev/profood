import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { AuthError, requestResetCode, verifyCode, resetPassword } from '../lib/auth'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

const isValidPhone = (v: string) => /^7\d{8}$/.test(v.replace(/[^\d]/g, '').replace(/^221/, ''))

type Step = 'phone' | 'otp' | 'password'

export function MotDePasseOubliePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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

  const submitPhone = () => {
    if (!isValidPhone(phone)) { setError(t('auth.phoneInvalidPeriod')); return }
    run(async () => { await requestResetCode(phone); setStep('otp') })
  }
  const submitOtp = () => {
    if (code.trim().length < 4) { setError(t('auth.errorOtpRequired')); return }
    run(async () => { await verifyCode(phone, code.trim(), 'PASSWORD_RESET'); setStep('password') })
  }
  const submitPassword = () => {
    if (password.length < 6) { setError(t('auth.passwordMinPeriod')); return }
    if (confirm !== password) { setError(t('auth.passwordMismatchPeriod')); return }
    run(async () => {
      await resetPassword({ phone, code: code.trim(), password, passwordConfirmation: confirm })
      navigate('/connexion', { replace: true, state: { passwordReset: true } })
    })
  }

  return (
    <>
      <AppBar title={t('auth.forgotPasswordTitle')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">{t('auth.resetTitle')}</h2>
          <p className="text-taupe text-[14px] mt-1">
            {step === 'phone' && t('auth.otpWillBeSent')}
            {step === 'otp' && t('auth.otpSentToShort', { phone })}
            {step === 'password' && t('auth.chooseNewPassword')}
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            {step === 'phone' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">{t('common.phone')}</span>
                  <input className={`${inputCls} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('common.phonePlaceholder')} inputMode="tel" autoComplete="tel" onKeyDown={(e) => { if (e.key === 'Enter') submitPhone() }} />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitPhone}>{busy ? t('auth.sending') : t('auth.receiveCode')}</Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">{t('auth.otpLabel')}</span>
                  <input className={`${inputCls} mt-1 text-center tracking-[0.5em] text-xl font-bold`} value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" onKeyDown={(e) => { if (e.key === 'Enter') submitOtp() }} />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitOtp}>{busy ? t('auth.verifying') : t('auth.verify')}</Button>
              </>
            )}

            {step === 'password' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">{t('auth.newPasswordLabel')}</span>
                  <input className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('auth.passwordPlaceholder')} autoComplete="new-password" />
                </label>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">{t('auth.confirmLabel')}</span>
                  <input className={`${inputCls} mt-1`} value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder={t('auth.passwordPlaceholder')} autoComplete="new-password" />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitPassword}>{busy ? t('auth.saving') : t('auth.changePassword')}</Button>
              </>
            )}
          </div>
        </div>
      </Page>
    </>
  )
}
