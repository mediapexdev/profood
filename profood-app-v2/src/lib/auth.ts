/**
 * Authentification client — implémentation LOCALE (comptes en localStorage,
 * mot de passe salé + haché via Web Crypto). Sert de socle testable sans
 * backend et SANS créer de vrais utilisateurs ni consommer de SMS.
 *
 * ┌─ SEAM API LARAVEL (à brancher plus tard) ──────────────────────────────┐
 * │ Contrat réel (cf. api-profood + profood-app) :                          │
 * │  • POST /signin   { phone_number, password, app_key }                    │
 * │      → 200 { token, user:{ phone_number, ... } }  (Bearer token Sanctum) │
 * │      ⚠ exige app_key = env PROFOOD_APP_KEY (secret prod, rôle CUSTOMER). │
 * │  • POST /signup   { phone_number, password, code, ... }                  │
 * │      code = OTP SMS → flux 2 étapes : POST demande de code, puis signup. │
 * │  • POST /password-reset { phone_number, code, password }                 │
 * │  • Téléphone SN : /(^3[3]|^7[5-80])[ ]?\d{3}([ ]?\d{2}){2}$/             │
 * │ Pour brancher : remplacer register/login/logout ci-dessous par des      │
 * │ appels axios, stocker le token, et poser l'entête Authorization.        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
import { saveContact } from './profile'

export interface Account {
  id: string
  name: string
  phone: string
  email?: string
  passwordHash: string
  salt: string
  createdAt: number
}

export interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
}

const ACCOUNTS_KEY = 'profood.accounts.v1'
const SESSION_KEY = 'profood.session.v1'

/** Normalise un numéro pour comparaison (retire espaces et indicatif +221). */
export function normalizePhone(v: string): string {
  return v.replace(/[^\d]/g, '').replace(/^221/, '')
}

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
function writeAccounts(list: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list))
}

function randId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID().slice(0, 12)
  return Math.floor(Math.random() * 1e12).toString(36)
}

/** SHA-256(salt + mot de passe) en hex. Placeholder local en attendant le serveur. */
async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function toUser(a: Account): AuthUser {
  return { id: a.id, name: a.name, phone: a.phone, email: a.email }
}

export function currentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const id = JSON.parse(raw) as string
    const acc = readAccounts().find((a) => a.id === id)
    return acc ? toUser(acc) : null
  } catch {
    return null
  }
}

export class AuthError extends Error {}

export async function register(input: {
  name: string
  phone: string
  email?: string
  password: string
}): Promise<AuthUser> {
  const phone = normalizePhone(input.phone)
  const accounts = readAccounts()
  if (accounts.some((a) => normalizePhone(a.phone) === phone)) {
    throw new AuthError('Un compte existe déjà avec ce numéro.')
  }
  const salt = randId()
  const acc: Account = {
    id: randId(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    passwordHash: await hash(input.password, salt),
    salt,
    createdAt: Date.now(),
  }
  writeAccounts([...accounts, acc])
  localStorage.setItem(SESSION_KEY, JSON.stringify(acc.id))
  // Alimente le profil (pré-remplissage checkout) avec les coordonnées.
  saveContact({ name: acc.name, phone: acc.phone, email: acc.email })
  return toUser(acc)
}

export async function login(phoneInput: string, password: string): Promise<AuthUser> {
  const phone = normalizePhone(phoneInput)
  const acc = readAccounts().find((a) => normalizePhone(a.phone) === phone)
  if (!acc || (await hash(password, acc.salt)) !== acc.passwordHash) {
    throw new AuthError('Numéro ou mot de passe incorrect.')
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(acc.id))
  saveContact({ name: acc.name, phone: acc.phone, email: acc.email })
  return toUser(acc)
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}
