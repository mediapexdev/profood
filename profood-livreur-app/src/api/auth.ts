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
 * The Profood app key is required by the /signin endpoint to gate access
 * by application.
 *
 * IMPORTANT — BACKEND GAP:
 * There is currently no LIVREUR role in the API (see Role.php: CUSTOMER=8,
 * MANAGER=16, ADMIN=32, SUPER_ADMIN=64).  Until a LIVREUR role and its
 * corresponding app key are added, driver accounts must be created with the
 * MANAGER role and authenticated via PROFOOD_APP_MANAGER_KEY.
 * See: TODO_BACKEND_GAPS.md for the full list of required backend changes.
 */
const APP_KEY =
  import.meta.env.VITE_PROFOOD_APP_KEY ?? ''

/**
 * Signs the driver in using phone number + password.
 *
 * POST /signin expects:
 *   { phone_number: string, password: string, app_key: string }
 *
 * The livreur app uses a 4-digit PIN as the password field. The backend
 * has a minimum-length of 8 characters for passwords, so the PIN must be
 * padded or the backend must be adjusted for livreur accounts.
 *
 * BACKEND GAP: The current password validation enforces `min(8)`.
 * See TODO_BACKEND_GAPS.md — Item 4.
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
