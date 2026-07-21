import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { AuthError } from '../lib/auth'
import { haptic } from '../lib/haptics'

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

/** Téléphone sénégalais : 9 chiffres commençant par 7, indicatif +221 toléré. */
function isValidPhone(v: string): boolean {
  return /^7\d{8}$/.test(v.replace(/[^\d]/g, '').replace(/^221/, ''))
}
function isValidEmail(v: string): boolean {
  return v.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function InscriptionPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const errors = {
    name: name.trim().length < 2 ? 'Nom requis' : '',
    phone: !isValidPhone(phone) ? 'Numéro sénégalais invalide (ex. 77 123 45 67)' : '',
    email: !isValidEmail(email) ? 'E-mail invalide' : '',
    password: password.length < 6 ? 'Au moins 6 caractères' : '',
    confirm: confirm !== password ? 'Les mots de passe ne correspondent pas' : '',
  }
  const valid = !Object.values(errors).some(Boolean)

  const submit = async () => {
    setTouched(true)
    setError('')
    if (!valid || busy) return
    setBusy(true)
    try {
      await register({ name, phone, email: email || undefined, password })
      haptic('medium')
      navigate('/compte', { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Inscription impossible. Réessayez.')
      setBusy(false)
    }
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

  return (
    <>
      <AppBar title="Créer un compte" back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-5 md:px-6 pt-6 flex flex-col">
          <h2 className="font-title text-2xl">Rejoignez PROFOOD</h2>
          <p className="text-taupe text-[14px] mt-1">Commandez plus vite et suivez vos livraisons.</p>

          <div className="mt-6 flex flex-col gap-3.5">
            {field('Nom complet', name, setName, errors.name, { placeholder: 'Awa Ndiaye', autoComplete: 'name' })}
            {field('Téléphone', phone, setPhone, errors.phone, { placeholder: '77 123 45 67', inputMode: 'tel', autoComplete: 'tel' })}
            {field('E-mail (facultatif)', email, setEmail, errors.email, { placeholder: 'awa@exemple.sn', inputMode: 'email', autoComplete: 'email' })}
            {field('Mot de passe', password, setPassword, errors.password, { type: 'password', placeholder: '••••••••', autoComplete: 'new-password' })}
            {field('Confirmer le mot de passe', confirm, setConfirm, errors.confirm, { type: 'password', placeholder: '••••••••', autoComplete: 'new-password' })}

            {error && <p className="text-[13px] font-semibold text-alerte">{error}</p>}

            <Button full disabled={busy} className="mt-1" onClick={submit}>{busy ? 'Création…' : 'Créer mon compte'}</Button>

            <div className="filet w-full my-2" />
            <p className="text-center text-[14px] text-taupe">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="font-bold text-terre">Se connecter</Link>
            </p>
          </div>
        </div>
      </Page>
    </>
  )
}
