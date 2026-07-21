import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { AuthError, requestResetCode, verifyCode, resetPassword } from '../lib/auth'
import { haptic } from '../lib/haptics'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

const isValidPhone = (v: string) => /^7\d{8}$/.test(v.replace(/[^\d]/g, '').replace(/^221/, ''))

type Step = 'phone' | 'otp' | 'password'

export function MotDePasseOubliePage() {
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
      setError(e instanceof AuthError ? e.message : 'Une erreur est survenue. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const submitPhone = () => {
    if (!isValidPhone(phone)) { setError('Numéro sénégalais invalide (ex. 77 123 45 67).'); return }
    run(async () => { await requestResetCode(phone); setStep('otp') })
  }
  const submitOtp = () => {
    if (code.trim().length < 4) { setError('Saisissez le code reçu par SMS.'); return }
    run(async () => { await verifyCode(phone, code.trim(), 'PASSWORD_RESET'); setStep('password') })
  }
  const submitPassword = () => {
    if (password.length < 6) { setError('Mot de passe : au moins 6 caractères.'); return }
    if (confirm !== password) { setError('Les mots de passe ne correspondent pas.'); return }
    run(async () => {
      await resetPassword({ phone, code: code.trim(), password, passwordConfirmation: confirm })
      navigate('/connexion', { replace: true, state: { passwordReset: true } })
    })
  }

  return (
    <>
      <AppBar title="Mot de passe oublié" back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">Réinitialiser le mot de passe</h2>
          <p className="text-taupe text-[14px] mt-1">
            {step === 'phone' && 'Un code de vérification vous sera envoyé par SMS.'}
            {step === 'otp' && `Entrez le code envoyé au ${phone}.`}
            {step === 'password' && 'Choisissez votre nouveau mot de passe.'}
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            {step === 'phone' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">Téléphone</span>
                  <input className={`${inputCls} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 123 45 67" inputMode="tel" autoComplete="tel" onKeyDown={(e) => { if (e.key === 'Enter') submitPhone() }} />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitPhone}>{busy ? 'Envoi…' : 'Recevoir le code'}</Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">Code de vérification</span>
                  <input className={`${inputCls} mt-1 text-center tracking-[0.5em] text-xl font-bold`} value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" onKeyDown={(e) => { if (e.key === 'Enter') submitOtp() }} />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitOtp}>{busy ? 'Vérification…' : 'Vérifier'}</Button>
              </>
            )}

            {step === 'password' && (
              <>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">Nouveau mot de passe</span>
                  <input className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="new-password" />
                </label>
                <label className="block">
                  <span className="text-[13px] font-bold text-taupe">Confirmer</span>
                  <input className={`${inputCls} mt-1`} value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="••••••••" autoComplete="new-password" />
                </label>
                {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}
                <Button full disabled={busy} className="mt-1" onClick={submitPassword}>{busy ? 'Enregistrement…' : 'Changer le mot de passe'}</Button>
              </>
            )}
          </div>
        </div>
      </Page>
    </>
  )
}
