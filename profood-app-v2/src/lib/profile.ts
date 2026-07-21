/**
 * Profil invité — mémorise coordonnées et adresses en localStorage pour
 * pré-remplir le checkout (friction minimale = plus de conversions). Isolé
 * derrière ces fonctions ; migrera vers le compte serveur quand l'auth existera.
 */
import type { OrderCustomer } from './orders'

export interface SavedAddress {
  id: string
  label: string
  address: string
  zoneId: string
  commune: string
}

export interface Profile {
  name: string
  phone: string
  email?: string
  addresses: SavedAddress[]
  defaultAddressId?: string
}

const STORAGE_KEY = 'profood.profile.v1'
const EMPTY: Profile = { name: '', phone: '', addresses: [] }

function id(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID().slice(0, 8)
  return Math.floor(Math.random() * 1e9).toString(36)
}

export function getProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const p = JSON.parse(raw) as Partial<Profile>
    return {
      name: p.name ?? '',
      phone: p.phone ?? '',
      email: p.email,
      addresses: Array.isArray(p.addresses) ? p.addresses : [],
      defaultAddressId: p.defaultAddressId,
    }
  } catch {
    return { ...EMPTY }
  }
}

function write(p: Profile): Profile {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* mode privé / quota : profil non persisté */
  }
  return p
}

export function saveContact(c: { name: string; phone: string; email?: string }): Profile {
  const p = getProfile()
  return write({ ...p, name: c.name, phone: c.phone, email: c.email })
}

/** Adresse par défaut (ou la première enregistrée). */
export function defaultAddress(p: Profile = getProfile()): SavedAddress | undefined {
  return p.addresses.find((a) => a.id === p.defaultAddressId) ?? p.addresses[0]
}

export function upsertAddress(input: Omit<SavedAddress, 'id'> & { id?: string }, makeDefault = false): Profile {
  const p = getProfile()
  let addresses = p.addresses
  let addrId = input.id
  if (addrId) {
    addresses = addresses.map((a) => (a.id === addrId ? { ...a, ...input, id: addrId! } : a))
  } else {
    // Dédoublonnage : même adresse + même zone = mise à jour, pas de doublon.
    const dup = addresses.find(
      (a) => a.address.trim().toLowerCase() === input.address.trim().toLowerCase() && a.zoneId === input.zoneId,
    )
    if (dup) {
      addrId = dup.id
      addresses = addresses.map((a) => (a.id === addrId ? { ...a, ...input, id: addrId! } : a))
    } else {
      addrId = id()
      addresses = [...addresses, { ...input, id: addrId }]
    }
  }
  const defaultAddressId = makeDefault || !p.defaultAddressId ? addrId : p.defaultAddressId
  return write({ ...p, addresses, defaultAddressId })
}

export function removeAddress(addrId: string): Profile {
  const p = getProfile()
  const addresses = p.addresses.filter((a) => a.id !== addrId)
  const defaultAddressId = p.defaultAddressId === addrId ? addresses[0]?.id : p.defaultAddressId
  return write({ ...p, addresses, defaultAddressId })
}

export function setDefaultAddress(addrId: string): Profile {
  return write({ ...getProfile(), defaultAddressId: addrId })
}

/** Après une commande : on retient coordonnées + adresse (par défaut). */
export function rememberFromOrder(c: OrderCustomer): void {
  saveContact({ name: c.name, phone: c.phone, email: c.email })
  upsertAddress({ label: c.commune, address: c.address, zoneId: c.zoneId, commune: c.commune }, true)
}
