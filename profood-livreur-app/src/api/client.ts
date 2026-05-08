import axios, { type AxiosError } from 'axios'

/**
 * Maximum number of automatic retry attempts for transient failures.
 * Kept low to keep the UI responsive — a driver in the field cannot wait
 * many seconds for each retry.
 */
const MAX_RETRIES = 2

/**
 * Initial delay (ms) before the first retry; doubles on each subsequent attempt.
 * Retry schedule: 1 s, 2 s.
 */
const INITIAL_RETRY_DELAY_MS = 1_000

/**
 * HTTP status codes that warrant a retry attempt.
 * 4xx errors (auth failures, validation, not-found) are NOT retried because
 * resending the same request will produce the same failure.
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true // network timeout / offline
  return RETRYABLE_STATUS_CODES.includes(error.response.status)
}

const retryDelay = (attempt: number): number =>
  INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Shared axios instance for all API calls.
 *
 * Base URL resolves to the production API in production mode and to the
 * local Laravel dev server in development, matching the pattern used by
 * profood-app and profood-manager-app.
 */
const apiClient = axios.create({
  baseURL:
    import.meta.env.PROD
      ? 'https://api.profood-app.com/api/'
      : 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Request interceptor — injects the Sanctum bearer token when present.
 *
 * Token lifecycle:
 *   - Written to localStorage by useAuth after a successful /signin
 *   - Cleared by useAuth on logout
 *   - Every request automatically picks up the current token so there is
 *     no need to pass it manually at each call site.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('profood_livreur_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor — handles retry logic with exponential back-off and
 * surfaces 401 Unauthorized errors for the auth layer to handle.
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as typeof error.config & { __retryCount?: number }
    if (!config) return Promise.reject(error)

    config.__retryCount = config.__retryCount ?? 0

    // Do not retry if we have exhausted attempts or if the error is non-transient.
    if (config.__retryCount >= MAX_RETRIES || !shouldRetry(error)) {
      return Promise.reject(error)
    }

    config.__retryCount += 1
    await sleep(retryDelay(config.__retryCount - 1))

    console.warn(
      `[api] Retrying request (${config.__retryCount}/${MAX_RETRIES}): ${config.url}`
    )

    return apiClient(config)
  }
)

export default apiClient
