import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { AuthError } from '../lib/auth'
import { haptic } from '../lib/haptics'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

export function ConnexionPage() {
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
      setError('Renseignez votre numéro et votre mot de passe.')
      return
    }
    setBusy(true)
    try {
      await login(phone, password)
      haptic('medium')
      navigate('/compte', { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Connexion impossible. Réessayez.')
      setBusy(false)
    }
  }

  return (
    <>
      <AppBar title="Connexion" back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">Bon retour 👋</h2>
          <p className="text-taupe text-[14px] mt-1">Connectez-vous pour retrouver vos commandes et adresses.</p>

          {(flash?.justRegistered || flash?.passwordReset) && (
            <p className="mt-3 rounded-xl bg-halal/12 text-halal text-[13px] font-semibold px-3.5 py-2.5">
              {flash.justRegistered ? 'Compte créé ! Connectez-vous pour continuer.' : 'Mot de passe modifié ! Connectez-vous.'}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3.5">
            <label className="block">
              <span className="text-[13px] font-bold text-taupe">Téléphone</span>
              <input className={`${inputCls} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 123 45 67" inputMode="tel" autoComplete="tel" />
            </label>
            <label className="block">
              <span className="text-[13px] font-bold text-taupe">Mot de passe</span>
              <input className={`${inputCls} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password"
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
            </label>

            {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}

            <Button full disabled={busy} className="mt-1" onClick={submit}>{busy ? 'Connexion…' : 'Se connecter'}</Button>

            <Link to="/mot-de-passe-oublie" className="text-center text-[13px] font-bold text-taupe active:text-terre">Mot de passe oublié ?</Link>

            <div className="filet w-full my-2" />
            <p className="text-center text-[14px] text-taupe">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-bold text-terre">Créer un compte</Link>
            </p>
          </div>
        </div>
      </Page>
    </>
  )
}
