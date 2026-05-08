import apiClient from './client'
import type { Driver } from '../types'

/**
 * Response shape returned by POST /signin.
 * The token is a Sanctum-compatible bearer token stored in the
 * user's `api_token` column and used for all subsequent requests.
 */
interface SigninResponse {
  message: string
  token: string
}

/**
 * Response shape returned by GET /user (protected route).
 * Only the fields relevant to the driver profile are listed here; the
 * Laravel response may include more fields that we intentionally discard.
 */
interface UserResponse {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  email: string
  avatar: string | null
  role: {
    id: number
    code: number
    wording: string
  }
}

/**
 * The livreur-specific app key sent to /signin. Must match the
 * PROFOOD_APP_LIVREUR_KEY env var on the Laravel backend, which gates
 * access for users with Role::LIVREUR (code 4).
 */
const APP_KEY = import.meta.env.VITE_PROFOOD_APP_LIVREUR_KEY ?? ''

/**
 * Signs the driver in using phone number + password.
 *
 * POST /signin expects:
 *   { phone_number: string, password: string, app_key: string }
 *
 * The signup-side password validator enforces `min(8)` on creation, so a
 * 4-digit PIN cannot be used as a livreur password — drivers authenticate
 * with a regular password.
 *
 * @returns The Sanctum bearer token on success.
 * @throws AxiosError with response.status 401 when credentials are wrong.
 */
export async function signin(
  phoneNumber: string,
  password: string
): Promise<string> {
  const response = await apiClient.post<SigninResponse>('/signin', {
    phone_number: phoneNumber,
    password,
    app_key: APP_KEY,
  })
  return response.data.token
}

/**
 * Fetches the currently authenticated driver's profile from GET /user.
 *
 * This is called immediately after a successful /signin so we can populate
 * the Driver object from real backend data rather than relying on local state.
 */
export async function fetchCurrentUser(token: string): Promise<Driver> {
  const response = await apiClient.get<UserResponse>('/user', {
    headers: { Authorization: `Bearer ${token}` },
  })

  const u = response.data
  return {
    // The backend uses integer ids; we convert to string to satisfy the
    // Driver interface which was designed around the mock's string ids.
    id: String(u.id),
    name: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
    phone: u.phone_number,
    avatar: u.avatar ?? undefined,
  }
}

/**
 * Calls POST /signout to invalidate the server-side session.
 * The request must include the bearer token in the Authorization header,
 * which the api client interceptor adds automatically from localStorage.
 *
 * Fire-and-forget: we always clear local state regardless of whether the
 * server call succeeds, so the driver cannot get stuck in a logged-in state.
 */
export async function signout(): Promise<void> {
  try {
    await apiClient.post('/signout')
  } catch {
    // Swallow the error — the local session is cleared regardless.
    console.warn('[auth] signout API call failed; clearing local state anyway.')
  }
}
