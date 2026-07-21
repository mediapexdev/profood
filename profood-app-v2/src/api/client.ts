import axios, { AxiosError } from 'axios'

/**
 * Client API — porté de l'app Ionic (profood-app/src/api/api.ts) pour
 * garder le MÊME contrat côté serveur : même base URL, même politique de
 * retry, même purge de session sur 401.
 *
 * Base URL : prod en build, API locale en dev (identique à l'app Ionic).
 * Vite expose `import.meta.env.PROD` là où CRA utilisait NODE_ENV.
 */
const BASE_URL = import.meta.env.PROD
  ? 'https://api.profood-app.com/api/'
  : 'http://localhost:8000/api/'

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true
  return RETRYABLE_STATUS_CODES.includes(error.response.status)
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const TOKEN_KEY = 'token'

/** Purge la session locale quand l'API signale un token invalide (401). */
function purgeExpiredSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token !== null) {
    localStorage.removeItem(token)
    localStorage.removeItem(TOKEN_KEY)
    window.dispatchEvent(new CustomEvent('auth:session-expired'))
  }
}

const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { __retryCount?: number }) | undefined

    // 401 : ne purger que si la requête portait bien le token stocké
    // (un mauvais mot de passe sur /signin ne doit pas vider une session valide).
    if (error.response?.status === 401) {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const sentAuth = (error.config?.headers as Record<string, unknown> | undefined)?.Authorization
      if (storedToken !== null && sentAuth === `Bearer ${storedToken}`) {
        purgeExpiredSession()
      }
    }

    if (!config) return Promise.reject(error)
    config.__retryCount = config.__retryCount ?? 0
    if (config.__retryCount >= MAX_RETRIES || !shouldRetry(error)) {
      return Promise.reject(error)
    }
    config.__retryCount += 1
    await delay(INITIAL_RETRY_DELAY * Math.pow(2, config.__retryCount - 1))
    return apiClient(config)
  },
)

export default apiClient
