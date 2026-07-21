import { createContext, useContext, useMemo, useState } from 'react'
import type { Slice } from '../lib/catalog'

export interface CartLine { slice: Slice; qty: number }

interface CartValue {
  lines: CartLine[]
  count: number
  total: number
  qtyOf: (id: number) => number
  add: (slice: Slice) => void
  setQty: (id: number, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const value = useMemo<CartValue>(() => {
    const add = (slice: Slice) =>
      setLines((prev) => {
        const i = prev.findIndex((l) => l.slice.id === slice.id)
        if (i >= 0) {
          const next = prev.slice()
          next[i] = { ...next[i], qty: next[i].qty + 1 }
          return next
        }
        return [...prev, { slice, qty: 1 }]
      })
    const setQty = (id: number, qty: number) =>
      setLines((prev) =>
        qty <= 0 ? prev.filter((l) => l.slice.id !== id) : prev.map((l) => (l.slice.id === id ? { ...l, qty } : l)),
      )
    const clear = () => setLines([])
    const qtyOf = (id: number) => lines.find((l) => l.slice.id === id)?.qty ?? 0
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const total = lines.reduce((s, l) => s + l.slice.price * l.qty, 0)
    return { lines, count, total, qtyOf, add, setQty, clear }
  }, [lines])

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
