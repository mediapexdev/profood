import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Driver } from '../types'
import { signin, fetchCurrentUser, signout as apiSignout } from '../api/auth'

/**
 * localStorage keys for persisting the session across page reloads.
 * Using localStorage so the driver stays logged in when they reopen the PWA
 * from the home screen. sessionStorage would clear on tab close.
 */
export const TOKEN_KEY = 'profood_livreur_token'
const DRIVER_KEY = 'profood_livreur_driver'

function readDriverFromStorage(): Driver | null {
  try {
    const raw = localStorage.getItem(DRIVER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Driver
  } catch {
    return null
  }
}

interface AuthContextValue {
  driver: Driver | null
  loading: boolean
  error: string | null
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * AuthProvider — single source of truth for driver authentication.
 *
 * Wrap the entire application tree in this provider so any component can
 * call `useAuth()` and read the same driver state without prop drilling.
 *
 * Auth flow:
 *   1. POST /signin with { phone_number, password, app_key }
 *   2. Receive Sanctum bearer token → persist to localStorage
 *   3. GET /user → receive driver profile → persist to localStorage
 *   4. Subsequent requests pick up the token via the axios interceptor in
 *      src/api/client.ts
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(readDriverFromStorage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (phone: string, password: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const token = await signin(phone, password)
        localStorage.setItem(TOKEN_KEY, token)

        const driverProfile = await fetchCurrentUser(token)
        localStorage.setItem(DRIVER_KEY, JSON.stringify(driverProfile))
        setDriver(driverProfile)

        return true
      } catch (err: unknown) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(DRIVER_KEY)

        const axiosError = err as {
          response?: { data?: { message?: string } }
        }
        setError(
          axiosError.response?.data?.message ??
            'Une erreur est survenue. Veuillez réessayer.'
        )
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback((): void => {
    void apiSignout()
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(DRIVER_KEY)
    setDriver(null)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ driver, loading, error, login, logout }),
    [driver, loading, error, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth — consumes the AuthContext.
 *
 * Must be called inside a component tree wrapped by AuthProvider.
 * Throws if called outside the provider to catch mis-use early.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
