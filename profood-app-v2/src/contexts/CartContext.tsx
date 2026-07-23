import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Slice } from '../lib/catalog'
import { useCatalog } from './CatalogContext'
import { ordersApiEnabled, fetchServerCartSlices } from '../api/orders'
import { currentToken } from '../lib/auth'

/**
 * Ligne de panier générique : une découpe à l'unité, ou une box composée.
 * `id` est la clé de regroupement (deux box identiques s'empilent).
 */
export interface CartLine {
  id: string
  kind: 'slice' | 'box'
  name: string
  unitPrice: number
  image: string
  qty: number
  cutIds?: number[]
  /** Box PRÉDÉFINIE : id du modèle serveur (box composée libre : absent). */
  boxTypeId?: number
}

interface CartValue {
  lines: CartLine[]
  count: number
  total: number
  qtyOf: (id: number) => number
  add: (slice: Slice) => void
  addBox: (label: string, unitPrice: number, cutIds: number[], image: string, boxTypeId?: number) => void
  setLineQty: (lineId: string, qty: number) => void
  setQty: (sliceId: number, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)
const STORAGE_KEY = 'profood.cart.v1'
const sliceLineId = (id: number) => `slice:${id}`

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const { slices: catalogSlices } = useCatalog()

  // Persistance panier invité : survit au rechargement / retour sur l'app.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* quota / mode privé : on ignore, le panier reste en mémoire */
    }
  }, [lines])

  // À la connexion : fusionne le panier SERVEUR (laissé par l'app v1 ou un
  // autre appareil) dans le panier local. Qté = max des deux (idempotent si
  // l'évènement rejoue). Le serveur sera réaligné sur le local au checkout.
  useEffect(() => {
    if (!ordersApiEnabled) return
    const onLogin = async () => {
      const token = currentToken()
      if (!token || token.startsWith('local:')) return
      const serverSlices = await fetchServerCartSlices(token)
      if (!serverSlices.length) return
      setLines((prev) => {
        let next = prev
        for (const { sliceId, qty } of serverSlices) {
          const slice = catalogSlices.find((s) => s.id === sliceId)
          if (!slice) continue
          const lineId = sliceLineId(sliceId)
          const i = next.findIndex((l) => l.id === lineId)
          if (i >= 0) {
            if (next[i].qty < qty) {
              next = next.slice()
              next[i] = { ...next[i], qty }
            }
          } else {
            next = [...next, { id: lineId, kind: 'slice', name: slice.name, unitPrice: slice.price, image: slice.image, qty }]
          }
        }
        return next
      })
    }
    window.addEventListener('auth:login', onLogin)
    return () => window.removeEventListener('auth:login', onLogin)
  }, [catalogSlices])

  const value = useMemo<CartValue>(() => {
    const bump = (lineId: string, make: () => CartLine) =>
      setLines((prev) => {
        const i = prev.findIndex((l) => l.id === lineId)
        if (i >= 0) {
          const next = prev.slice()
          next[i] = { ...next[i], qty: next[i].qty + 1 }
          return next
        }
        return [...prev, make()]
      })

    const add = (slice: Slice) =>
      bump(sliceLineId(slice.id), () => ({
        id: sliceLineId(slice.id),
        kind: 'slice',
        name: slice.name,
        unitPrice: slice.price,
        image: slice.image,
        qty: 1,
      }))

    const addBox = (label: string, unitPrice: number, cutIds: number[], image: string, boxTypeId?: number) => {
      const key = [...cutIds].sort((a, b) => a - b).join('-')
      const id = boxTypeId ? `boxtype:${boxTypeId}:${key}` : `box:${key}`
      bump(id, () => ({ id, kind: 'box', name: label, unitPrice, image, qty: 1, cutIds, boxTypeId }))
    }

    const setLineQty = (lineId: string, qty: number) =>
      setLines((prev) =>
        qty <= 0 ? prev.filter((l) => l.id !== lineId) : prev.map((l) => (l.id === lineId ? { ...l, qty } : l)),
      )

    const setQty = (sliceId: number, qty: number) => setLineQty(sliceLineId(sliceId), qty)
    const clear = () => setLines([])
    const qtyOf = (id: number) => lines.find((l) => l.id === sliceLineId(id))?.qty ?? 0
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
    return { lines, count, total, qtyOf, add, addBox, setLineQty, setQty, clear }
  }, [lines])

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
