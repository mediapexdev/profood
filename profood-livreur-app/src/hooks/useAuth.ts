import { useState } from 'react'
import type { Driver } from '../types/index'
import driverData from '../mocks/driver.json'

// Session storage key for persisting the authenticated driver across page reloads.
const SESSION_KEY = 'profood_livreur_driver'

/**
 * Reads a stored driver object from sessionStorage.
 * Returns null if nothing is stored or the stored value is malformed.
 */
function readDriverFromSession(): Driver | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Driver
  } catch {
    // Corrupt sessionStorage entry — treat as unauthenticated.
    return null
  }
}

export interface UseAuthReturn {
  driver: Driver | null
  /** Accepts any phone/pin combination in mock mode. Always resolves true after 500 ms. */
  login: (phone: string, pin: string) => Promise<boolean>
  logout: () => void
}

/**
 * Manages authentication state for the delivery driver.
 *
 * In this mock implementation any credentials are accepted. The real
 * implementation would POST to /api/livreur/signin and validate a Firebase
 * ID token or a Sanctum token.
 */
export function useAuth(): UseAuthReturn {
  const [driver, setDriver] = useState<Driver | null>(readDriverFromSession)

  /**
   * Mock login: ignores the supplied credentials and always succeeds.
   * Saves the mock driver to sessionStorage so the session survives a refresh.
   */
  const login = (_phone: string, _pin: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const authenticatedDriver: Driver = {
          id: driverData.id,
          name: driverData.name,
          email: driverData.email,
          phone: driverData.phone,
          // avatar is null in the JSON; treat null as undefined to satisfy the
          // optional string type.
          avatar: driverData.avatar ?? undefined,
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedDriver))
        setDriver(authenticatedDriver)
        resolve(true)
      }, 500)
    })
  }

  const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY)
    setDriver(null)
  }

  return { driver, login, logout }
}
