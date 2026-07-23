import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { authMode, currentUser, login as doLogin, logout as doLogout, registerLocal } from '../lib/auth'

interface AuthValue {
  user: AuthUser | null
  isAuthenticated: boolean
  mode: 'api' | 'local'
  login: (phone: string, password: string) => Promise<void>
  /** Inscription immédiate (mode local uniquement) — connecte l'utilisateur. */
  register: (input: { firstName: string; lastName: string; email?: string; phone: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  /** Relit la session persistée (après convert-guest-order, édition profil…). */
  refresh: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(currentUser)

  // L'intercepteur API émet cet évènement sur 401 → repasser en déconnecté.
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      mode: authMode,
      login: async (phone, password) => {
        setUser(await doLogin(phone, password))
        // Le panier écoute cet évènement pour fusionner le panier serveur.
        window.dispatchEvent(new CustomEvent('auth:login'))
      },
      register: async (input) => {
        setUser(await registerLocal(input))
        window.dispatchEvent(new CustomEvent('auth:login'))
      },
      logout: async () => { await doLogout(); setUser(null) },
      refresh: () => setUser(currentUser()),
    }),
    [user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
