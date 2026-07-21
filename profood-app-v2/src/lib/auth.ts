/**
 * Authentification client — DOUBLE MODE.
 *
 *   • Mode API (prod) : actif dès que VITE_APP_KEY est défini. Branché sur
 *     l'API Laravel, porté fidèlement de l'app Ionic (mêmes endpoints,
 *     charges utiles, OTP SMS, token). Voir .env.example.
 *   • Mode local (dev/démo) : actif sans VITE_APP_KEY. Comptes en localStorage,
 *     mot de passe salé + haché (Web Crypto). Permet un parcours 100 %
 *     fonctionnel (inscription/connexion) sans backend ni SMS.
 *
 * Le stockage de session est identique dans les deux modes (clé `token` +
 * infos indexées par le token), donc currentUser()/logout() sont communs.
 *
 * Contrat API (mode prod), extrait de profood-app :
 *   signin : POST /signin {phone_number,password,app_key} → {token}
 *            puis GET /customer (Bearer).
 *   signup : /check-user-data-requesting-registration (SMS) →
 *            /check-verification-code {for:'REGISTRATION'} → /signup.
 *   reset  : /user-phonenumber-exists (SMS) →
 *            /check-verification-code {for:'PASSWORD_RESET'} → /password-reset.
 */
import api, { TOKEN_KEY } from '../api/client'
import { saveContact } from './profile'

const APP_KEY = import.meta.env.VITE_APP_KEY as string | undefined
export const authMode: 'api' | 'local' = APP_KEY ? 'api' : 'local'

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

/** Erreur porteuse d'un message affichable (déjà en français). */
export class AuthError extends Error {}

function fail(error: unknown, fallback: string): never {
  const e = error as { response?: { data?: { message?: string } } }
  throw new AuthError(e?.response?.data?.message || fallback)
}

const fullName = (first: string, last: string) => `${first ?? ''} ${last ?? ''}`.trim()

// ── Session (commune aux deux modes) ──────────────────────────────────────
function persist(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(token, JSON.stringify(user))
  saveContact({ name: user.name, phone: user.phone, email: user.email })
}

export function currentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function currentUser(): AuthUser | null {
  try {
    const token = currentToken()
    if (!token) return null
    const raw = localStorage.getItem(token)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function clearSession(): void {
  const token = currentToken()
  if (token) localStorage.removeItem(token)
  localStorage.removeItem(TOKEN_KEY)
}

// ── Comptes locaux (mode local) ───────────────────────────────────────────
const ACCOUNTS_KEY = 'profood.accounts.v1'
interface LocalAccount extends AuthUser { passwordHash: string; salt: string }

const normalizePhone = (v: string) => v.replace(/[^\d]/g, '').replace(/^221/, '')
function randId(): string {
  const c = globalThis.crypto
  return c?.randomUUID ? c.randomUUID().slice(0, 12) : Math.floor(Math.random() * 1e12).toString(36)
}
async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
function readAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
const writeAccounts = (l: LocalAccount[]) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(l))
const toUser = (a: LocalAccount): AuthUser => ({
  id: a.id, userId: a.userId, firstName: a.firstName, lastName: a.lastName,
  name: a.name, phone: a.phone, email: a.email,
})

// ── Inscription (mode local, une étape) ───────────────────────────────────
export async function registerLocal(input: {
  firstName: string; lastName: string; email?: string; phone: string; password: string
}): Promise<AuthUser> {
  const accounts = readAccounts()
  if (accounts.some((a) => normalizePhone(a.phone) === normalizePhone(input.phone))) {
    throw new AuthError('Un compte existe déjà avec ce numéro.')
  }
  const salt = randId()
  const acc: LocalAccount = {
    id: Date.now(), userId: Date.now(),
    firstName: input.firstName.trim(), lastName: input.lastName.trim(),
    name: fullName(input.firstName, input.lastName),
    phone: input.phone.trim(), email: input.email?.trim() || undefined,
    passwordHash: await hash(input.password, salt), salt,
  }
  writeAccounts([...accounts, acc])
  const token = `local:${randId()}`
  persist(token, toUser(acc))
  return toUser(acc)
}

async function loginLocal(phone: string, password: string): Promise<AuthUser> {
  const acc = readAccounts().find((a) => normalizePhone(a.phone) === normalizePhone(phone))
  if (!acc || (await hash(password, acc.salt)) !== acc.passwordHash) {
    throw new AuthError('Numéro ou mot de passe incorrect.')
  }
  const token = `local:${randId()}`
  persist(token, toUser(acc))
  return toUser(acc)
}

// ── Connexion / déconnexion (unifiées) ────────────────────────────────────
export async function login(phone: string, password: string): Promise<AuthUser> {
  if (authMode === 'local') return loginLocal(phone, password)
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
      id: res.data.id ?? null, userId: u.id ?? null,
      firstName: u.first_name ?? '', lastName: u.last_name ?? '',
      name: fullName(u.first_name, u.last_name), phone: u.phone_number ?? phone,
      email: u.email ?? undefined, avatar: u.avatar ?? null, role: u.role,
    }
    persist(token, user)
    return user
  } catch (e) {
    fail(e, 'Impossible de récupérer votre profil. Réessayez.')
  }
}

export async function logout(): Promise<void> {
  const token = currentToken()
  if (authMode === 'api' && token) {
    try {
      await api.post('/signout', { app_key: APP_KEY }, { headers: { Authorization: `Bearer ${token}` } })
    } catch { /* best-effort */ }
  }
  clearSession()
}

// ── Inscription (mode API, 3 étapes) ──────────────────────────────────────
export async function requestSignupCode(input: {
  firstName: string; lastName: string; email?: string; phone: string
}): Promise<void> {
  try {
    await api.post('/check-user-data-requesting-registration', {
      first_name: input.firstName, last_name: input.lastName,
      email: input.email ?? '', phone_number: input.phone,
      avatar_input_action: 'none', app_key: APP_KEY,
    })
  } catch (e) { fail(e, 'Impossible d’envoyer le code. Réessayez.') }
}

export async function verifyCode(phone: string, code: string, purpose: CodePurpose): Promise<void> {
  try {
    await api.post('/check-verification-code', { app_key: APP_KEY, phone_number: phone, for: purpose, code })
  } catch (e) { fail(e, 'Code invalide !') }
}

export async function completeSignup(input: {
  firstName: string; lastName: string; email?: string; phone: string
  code: string; password: string; passwordConfirmation: string
}): Promise<void> {
  try {
    await api.post('/signup', {
      first_name: input.firstName, last_name: input.lastName, phone_number: input.phone,
      email: input.email ?? '', code: input.code, password: input.password,
      password_confirmation: input.passwordConfirmation, avatar_input_action: 'none', app_key: APP_KEY,
    })
  } catch (e) { fail(e, 'Inscription impossible. Réessayez.') }
}

// ── Réinitialisation du mot de passe ──────────────────────────────────────
export async function requestResetCode(phone: string): Promise<void> {
  try {
    await api.post('/user-phonenumber-exists', { phone_number: phone, app_key: APP_KEY })
  } catch (e) { fail(e, 'Impossible d’envoyer le code. Réessayez.') }
}

export async function resetPassword(input: {
  phone: string; code: string; password: string; passwordConfirmation: string
}): Promise<void> {
  if (authMode === 'local') {
    const accounts = readAccounts()
    const i = accounts.findIndex((a) => normalizePhone(a.phone) === normalizePhone(input.phone))
    if (i < 0) throw new AuthError('Aucun compte avec ce numéro.')
    const salt = randId()
    accounts[i] = { ...accounts[i], salt, passwordHash: await hash(input.password, salt) }
    writeAccounts(accounts)
    return
  }
  try {
    await api.post('/password-reset', {
      app_key: APP_KEY, phone_number: input.phone, code: input.code,
      password: input.password, password_confirmation: input.passwordConfirmation,
    })
  } catch (e) { fail(e, 'Réinitialisation impossible. Réessayez.') }
}
