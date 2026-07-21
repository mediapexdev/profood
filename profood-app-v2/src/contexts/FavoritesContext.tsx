import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Favoris client — persistés en localStorage (invité). Set d'ids de découpe.
 * Alimente le cœur sur les cartes/fiches et la page « Mes découpes favorites ».
 */
interface FavoritesValue {
  ids: number[]
  count: number
  has: (id: number) => boolean
  toggle: (id: number) => void
}

const FavoritesContext = createContext<FavoritesValue | null>(null)
const STORAGE_KEY = 'profood.favs.v1'

function load(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      /* mode privé / quota : favoris en mémoire seulement */
    }
  }, [ids])

  const toggle = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]))
  }, [])

  const value = useMemo<FavoritesValue>(
    () => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle }),
    [ids, toggle],
  )

  return <FavoritesContext value={value}>{children}</FavoritesContext>
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites doit être utilisé dans <FavoritesProvider>')
  return ctx
}
