import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Driver } from '../types'
import { signin, fetchCurrentUser, signout as apiSignout } from '../api/auth'
import { setAuthToken } from '../api/client'
import { getItem, setItem, removeItem, StorageKeys } from '../lib/storage'
import {
  getBiometricStatus,
  promptBiometric,
  type BiometryLabel,
} from '../lib/biometric'

/**
 * AuthProvider — single source of truth for the driver session.
 *
 * Compared with the previous synchronous-localStorage version, this provider:
 *   1. Hydrates session state asynchronously from @capacitor/preferences on
 *      native (localStorage on web), exposed via `bootstrapping`.
 *   2. Mirrors the live token into the axios interceptor cache so it does not
 *      have to await Preferences on every request.
 *   3. Tracks an optional biometric lock: when the driver enrols on a device,
 *      subsequent app opens stay `isLocked === true` until `unlock()` passes a
 *      Face ID / Touch ID / fingerprint prompt. Sign-out clears enrolment so
 *      the next driver on the same device cannot bypass password login.
 */
interface AuthContextValue {
  driver: Driver | null
  loading: boolean
  error: string | null

  /** True while the initial async hydration from storage is in flight. */
  bootstrapping: boolean

  /**
   * Reports the device's biometric capability. `available` is false on web
   * and on native devices without enrolled biometrics — the UI should hide
   * the enrolment prompt and the unlock gate in that case.
   */
  biometric: { available: boolean; label: BiometryLabel }

  /** True once the driver has opted into biometric unlock on this device. */
  biometricEnrolled: boolean

  /**
   * True when a stored session exists but a biometric prompt has not yet
   * succeeded for the current app launch. False when biometric is not
   * enrolled (login goes straight through).
   */
  isLocked: boolean

  login: (phone: string, password: string) => Promise<boolean>
  logout: () => Promise<void>

  /** Activates biometric unlock for this device. Returns false on prompt failure. */
  enrollBiometric: () => Promise<boolean>

  /** Disables biometric unlock without ending the session. */
  disableBiometric: () => Promise<void>

  /** Prompts biometric to clear the lock. Returns false on prompt failure. */
  unlock: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [biometric, setBiometric] = useState<{ available: boolean; label: BiometryLabel }>({
    available: false,
    label: 'biométrie',
  })
  const [biometricEnrolled, setBiometricEnrolled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  // ── Initial hydration from persistent storage ──────────────────────────
  useEffect(() => {
    let cancelled = false

    void (async () => {
      const [token, driverRaw, enrolledRaw, bioStatus] = await Promise.all([
        getItem(StorageKeys.token),
        getItem(StorageKeys.driver),
        getItem(StorageKeys.biometricEnrolled),
        getBiometricStatus(),
      ])
      if (cancelled) return

      setBiometric(bioStatus)
      const enrolled = enrolledRaw === 'true' && bioStatus.available

      if (token && driverRaw) {
        try {
          const parsed = JSON.parse(driverRaw) as Driver
          setAuthToken(token)
          setDriver(parsed)
          // If enrolment is on, keep the session sealed until unlock().
          setIsLocked(enrolled)
        } catch {
          // Corrupt driver blob — discard the whole session.
          await Promise.all([
            removeItem(StorageKeys.token),
            removeItem(StorageKeys.driver),
            removeItem(StorageKeys.biometricEnrolled),
          ])
          setAuthToken(null)
        }
      } else if (enrolledRaw === 'true') {
        // No session but enrolment leftover — clean it up.
        await removeItem(StorageKeys.biometricEnrolled)
      }

      setBiometricEnrolled(enrolled)
      setBootstrapping(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // ── Auth actions ───────────────────────────────────────────────────────
  const login = useCallback(
    async (phone: string, password: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const token = await signin(phone, password)
        const driverProfile = await fetchCurrentUser(token)

        await setItem(StorageKeys.token, token)
        await setItem(StorageKeys.driver, JSON.stringify(driverProfile))
        setAuthToken(token)
        setDriver(driverProfile)
        // A fresh password login implicitly unlocks the session; the user can
        // opt into biometric immediately after via the enrollment prompt.
        setIsLocked(false)
        return true
      } catch (err: unknown) {
        await Promise.all([
          removeItem(StorageKeys.token),
          removeItem(StorageKeys.driver),
        ])
        setAuthToken(null)

        const axiosError = err as { response?: { data?: { message?: string } } }
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

  const logout = useCallback(async (): Promise<void> => {
    void apiSignout()
    await Promise.all([
      removeItem(StorageKeys.token),
      removeItem(StorageKeys.driver),
      removeItem(StorageKeys.biometricEnrolled),
    ])
    setAuthToken(null)
    setDriver(null)
    setBiometricEnrolled(false)
    setIsLocked(false)
    setError(null)
  }, [])

  const enrollBiometric = useCallback(async (): Promise<boolean> => {
    if (!biometric.available) return false
    const ok = await promptBiometric(
      'Confirmez votre identité pour activer le déverrouillage rapide'
    )
    if (!ok) return false
    await setItem(StorageKeys.biometricEnrolled, 'true')
    setBiometricEnrolled(true)
    return true
  }, [biometric.available])

  const disableBiometric = useCallback(async (): Promise<void> => {
    await removeItem(StorageKeys.biometricEnrolled)
    setBiometricEnrolled(false)
    setIsLocked(false)
  }, [])

  const unlock = useCallback(async (): Promise<boolean> => {
    const ok = await promptBiometric('Déverrouillez votre session Profood')
    if (!ok) return false
    setIsLocked(false)
    return true
  }, [])

  const value = useMemo(
    () => ({
      driver,
      loading,
      error,
      bootstrapping,
      biometric,
      biometricEnrolled,
      isLocked,
      login,
      logout,
      enrollBiometric,
      disableBiometric,
      unlock,
    }),
    [
      driver,
      loading,
      error,
      bootstrapping,
      biometric,
      biometricEnrolled,
      isLocked,
      login,
      logout,
      enrollBiometric,
      disableBiometric,
      unlock,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// Re-exported for callers that still read it directly (e.g. legacy axios
// interceptors). New code should rely on the in-memory token cache set via
// setAuthToken in src/api/client.ts.
export const TOKEN_KEY = StorageKeys.token
