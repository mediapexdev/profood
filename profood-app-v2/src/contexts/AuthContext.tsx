import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { currentUser, login as doLogin, logout as doLogout } from '../lib/auth'

interface AuthValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(currentUser)

  // L'intercepteur API (client.ts) émet cet évènement sur 401 : la session a
  // expiré côté serveur → on repasse l'UI en état déconnecté.
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:session-expired', onExpired)
    return () => window.removeEventListener('auth:session-expired', onExpired)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login: async (phone, password) => setUser(await doLogin(phone, password)),
      logout: async () => { await doLogout(); setUser(null) },
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
