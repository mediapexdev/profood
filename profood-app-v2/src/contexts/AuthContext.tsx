import { createContext, useContext, useMemo, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { currentUser, login as doLogin, register as doRegister, logout as doLogout } from '../lib/auth'

interface AuthValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (input: { name: string; phone: string; email?: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(currentUser)

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login: async (phone, password) => setUser(await doLogin(phone, password)),
      register: async (input) => setUser(await doRegister(input)),
      logout: () => { doLogout(); setUser(null) },
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
