import { createContext, useContext, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Slice, Category, Box } from '../lib/catalog'
import { SLICES as LOCAL_SLICES, CATEGORIES as LOCAL_CATEGORIES, BOXES as LOCAL_BOXES } from '../lib/catalog'
import { fetchApiCatalog } from '../api/catalog'

/**
 * Source du catalogue — bascule progressive derrière un drapeau.
 *   VITE_USE_API_CATALOG !== 'true'  → données locales (défaut, comportement actuel)
 *   VITE_USE_API_CATALOG === 'true'  → API Laravel (images locales conservées)
 *
 * Dans tous les cas on part des données locales pour éviter tout écran vide :
 * l'API vient les remplacer quand elle a répondu, et on retombe sur le local
 * en cas d'erreur. Zéro régression.
 */
const USE_API = import.meta.env.VITE_USE_API_CATALOG === 'true'

interface CatalogValue {
  slices: Slice[]
  categories: Category[]
  boxes: Box[]
  slicesByCategory: (categoryId: number) => Slice[]
  source: 'local' | 'api'
  loading: boolean
}

const CatalogContext = createContext<CatalogValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog'],
    queryFn: fetchApiCatalog,
    enabled: USE_API,
    staleTime: 5 * 60_000,
  })

  const usingApi = USE_API && !!data && !isError
  const slices = usingApi ? data!.slices : LOCAL_SLICES
  const categories = usingApi ? data!.categories : LOCAL_CATEGORIES
  // Affichage toujours du moins cher au plus cher, quelle que soit la source.
  const boxes = useMemo(
    () => [...(usingApi && data!.boxes.length ? data!.boxes : LOCAL_BOXES)].sort((a, b) => a.price - b.price),
    [usingApi, data],
  )

  const value = useMemo<CatalogValue>(
    () => ({
      slices,
      categories,
      boxes,
      slicesByCategory: (categoryId) => slices.filter((s) => s.categoryId === categoryId),
      source: usingApi ? 'api' : 'local',
      loading: USE_API && isLoading,
    }),
    [slices, categories, boxes, usingApi, isLoading],
  )

  return <CatalogContext value={value}>{children}</CatalogContext>
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog doit être utilisé dans <CatalogProvider>')
  return ctx
}
