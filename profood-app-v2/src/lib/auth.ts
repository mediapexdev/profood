/**
 * Authentification client — branchée sur l'API Laravel, portée fidèlement de
 * l'app Ionic (profood-app/src/pages/auth/**). Mêmes endpoints, mêmes charges
 * utiles, même stockage du token.
 *
 * Prérequis d'exécution (identiques à l'app Ionic) :
 *   • L'API doit être joignable (prod https://api.profood-app.com, ou
 *     http://localhost:8000 en dev — cf. api/client.ts).
 *   • VITE_APP_KEY doit valoir le PROFOOD_APP_KEY du serveur (secret prod).
 *     Sans lui, l'API rejette signin/signup (rôle CUSTOMER). Voir .env.example.
 *
 * Flux (identiques à l'Ionic) :
 *   login    : POST /signin {phone_number,password,app_key} → {token}
 *              puis GET /customer (Bearer) → infos utilisateur.
 *   signup   : 1) POST /check-user-data-requesting-registration  (envoi SMS)
 *              2) POST /check-verification-code {for:'REGISTRATION',code}
 *              3) POST /signup {...,code,password,password_confirmation}
 *   reset    : 1) POST /user-phonenumber-exists                  (envoi SMS)
 *              2) POST /check-verification-code {for:'PASSWORD_RESET',code}
 *              3) POST /password-reset {...,code,password,password_confirmation}
 */
import api, { TOKEN_KEY } from '../api/client'
import { saveContact } from './profile'

const APP_KEY = import.meta.env.VITE_APP_KEY as string | undefined

export interface AuthUser {
  id: number | null
  userId: number | null
  firstName: string
  lastName: string
  name: string
  phone: string
  email?: string
  avatar?: string | null
  role?: unknown
}

export type CodePurpose = 'REGISTRATION' | 'PASSWORD_RESET'

/** Erreur porteuse du message serveur (déjà en français côté API). */
export class AuthError extends Error {}

function fail(error: unknown, fallback: string): never {
  const e = error as { response?: { data?: { message?: string } } }
  throw new AuthError(e?.response?.data?.message || fallback)
}

function fullName(first: string, last: string): string {
  return `${first ?? ''} ${last ?? ''}`.trim()
}

function persist(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(token, JSON.stringify(user)) // infos indexées par le token (comme l'Ionic)
  saveContact({ name: user.name, phone: user.phone, email: user.email })
}

export function currentUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    const raw = localStorage.getItem(token)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function currentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function login(phone: string, password: string): Promise<AuthUser> {
  let token: string
  try {
    const res = await api.post('/signin', { phone_number: phone, password, app_key: APP_KEY })
    token = res.data.token
  } catch (e) {
    fail(e, 'Numéro ou mot de passe incorrect.')
  }
  try {
    const res = await api.get('/customer', { headers: { Authorization: `Bearer ${token}` } })
    const u = res.data.user
    const user: AuthUser = {
      id: res.data.id ?? null,
      userId: u.id ?? null,
      firstName: u.first_name ?? '',
      lastName: u.last_name ?? '',
      name: fullName(u.first_name, u.last_name),
      phone: u.phone_number ?? phone,
      email: u.email ?? undefined,
      avatar: u.avatar ?? null,
      role: u.role,
    }
    persist(token, user)
    return user
  } catch (e) {
    fail(e, 'Impossible de récupérer votre profil. Réessayez.')
  }
}

export async function logout(): Promise<void> {
  const token = currentToken()
  try {
    if (token) await api.post('/signout', { app_key: APP_KEY }, { headers: { Authorization: `Bearer ${token}` } })
  } catch {
    /* déconnexion best-effort : on purge le local même si l'appel échoue */
  }
  if (token) localStorage.removeItem(token)
  localStorage.removeItem(TOKEN_KEY)
}

// ── Inscription (3 étapes) ────────────────────────────────────────────────
export async function requestSignupCode(input: {
  firstName: string
  lastName: string
  email?: string
  phone: string
}): Promise<void> {
  try {
    await api.post('/check-user-data-requesting-registration', {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email ?? '',
      phone_number: input.phone,
      avatar_input_action: 'none',
      app_key: APP_KEY,
    })
  } catch (e) {
    fail(e, 'Impossible d’envoyer le code. Réessayez.')
  }
}

export async function verifyCode(phone: string, code: string, purpose: CodePurpose): Promise<void> {
  try {
    await api.post('/check-verification-code', { app_key: APP_KEY, phone_number: phone, for: purpose, code })
  } catch (e) {
    fail(e, 'Code invalide !')
  }
}

export async function completeSignup(input: {
  firstName: string
  lastName: string
  email?: string
  phone: string
  code: string
  password: string
  passwordConfirmation: string
}): Promise<void> {
  try {
    await api.post('/signup', {
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phone,
      email: input.email ?? '',
      code: input.code,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
      avatar_input_action: 'none',
      app_key: APP_KEY,
    })
  } catch (e) {
    fail(e, 'Inscription impossible. Réessayez.')
  }
}

// ── Réinitialisation du mot de passe (3 étapes) ───────────────────────────
export async function requestResetCode(phone: string): Promise<void> {
  try {
    await api.post('/user-phonenumber-exists', { phone_number: phone, app_key: APP_KEY })
  } catch (e) {
    fail(e, 'Impossible d’envoyer le code. Réessayez.')
  }
}

export async function resetPassword(input: {
  phone: string
  code: string
  password: string
  passwordConfirmation: string
}): Promise<void> {
  try {
    await api.post('/password-reset', {
      app_key: APP_KEY,
      phone_number: input.phone,
      code: input.code,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    })
  } catch (e) {
    fail(e, 'Réinitialisation impossible. Réessayez.')
  }
}
