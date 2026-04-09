/**
 * LoginPage — phone + 4-digit PIN authentication screen.
 *
 * The form intentionally keeps state local to the component; there is no
 * global form library needed for a two-field login screen. Error feedback is
 * shown inline below the submit button so the driver does not need to scroll
 * to find validation messages.
 *
 * The PIN field uses `type="password"` so the device's OS masks the digits
 * by default. A visibility toggle lets the driver double-check their entry
 * before submitting. `tracking-[0.5em]` visually separates digits while they
 * are visible, mimicking a PIN-pad feel.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Basic client-side guard — the API would enforce stricter rules.
    if (!phone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone.')
      return
    }
    if (pin.length < 4) {
      setError('Le code PIN doit comporter 4 chiffres.')
      return
    }

    setLoading(true)
    try {
      const success = await login(phone.trim(), pin)
      if (success) {
        navigate('/', { replace: true })
      } else {
        // In mock mode this branch is never reached; kept for the real API.
        setError('Identifiants incorrects. Veuillez réessayer.')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background-light flex flex-col">
      {/* ── Scrollable content area ── */}
      <main className="flex-1 flex flex-col justify-center px-6 py-10 w-full">

        {/* ── Logo / branding block ── */}
        <div className="flex flex-col items-center gap-3 mb-10">
          {/* Primary circle acts as the app icon placeholder */}
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Icon name="local_shipping" filled size="xl" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profood</h1>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Espace Livreur
          </p>
        </div>

        {/* ── Login form ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Phone number field */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              <Icon name="phone_iphone" size="md" />
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          {/* PIN field */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              <Icon name="lock_open" size="md" />
            </span>
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="Code PIN (4 chiffres)"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                // Only allow digit characters to prevent non-numeric input.
                const digits = e.target.value.replace(/\D/g, '')
                setPin(digits)
              }}
              disabled={loading}
              className="w-full h-14 pl-12 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
              style={{ letterSpacing: pin ? '0.5em' : undefined }}
            />
            {/* Visibility toggle — placed on the right of the PIN field */}
            <button
              type="button"
              onClick={() => setShowPin((prev) => !prev)}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors disabled:opacity-60"
              aria-label={showPin ? 'Masquer le PIN' : 'Afficher le PIN'}
            >
              <Icon name={showPin ? 'visibility_off' : 'visibility'} size="md" />
            </button>
          </div>

          {/* Inline error message */}
          {error && (
            <p role="alert" className="text-sm text-red-600 font-medium text-center">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 active:scale-[0.98] transition disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                {/* Spinning border trick — no extra library needed */}
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Connexion…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* ── Help link ── */}
        <div className="mt-8 text-center">
          <a
            href="mailto:support@profood-app.com"
            className="text-sm text-primary font-medium hover:underline"
          >
            Besoin d'aide ?
          </a>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="text-center text-xs text-gray-400 font-medium"
        style={{ paddingBottom: 'max(32px, var(--sai-bottom))' }}
      >
        Profood Livreur v1.0
      </footer>
    </div>
  )
}
