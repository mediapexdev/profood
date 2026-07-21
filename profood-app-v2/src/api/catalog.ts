/**
 * Catalogue depuis l'API Laravel — Phase 0 de la bascule progressive.
 * Endpoints publics (aucun app_key) : get-slices, get-categories-with-slices-count.
 *
 * Stratégie images (décision projet) : on garde les assets DISQUE de la v2,
 * résolus par id (les IDs API === IDs v2). L'`illustration` de l'API n'est
 * qu'un secours (base64 pour les vieilles lignes, chemin disque pour les
 * récentes) → évite d'embarquer le base64 lourd.
 */
import api from './client'
import type { Slice, Category } from '../lib/catalog'
import { SLICES as LOCAL_SLICES, CATEGORIES as LOCAL_CATEGORIES, categoryLabel } from '../lib/catalog'

const localImageBySliceId = new Map(LOCAL_SLICES.map((s) => [s.id, s.image]))
const localImageByCategoryId = new Map(LOCAL_CATEGORIES.map((c) => [c.id, c.image]))
const localCategoryNameById = new Map(LOCAL_CATEGORIES.map((c) => [c.id, c.name]))

interface ApiSlice {
  id: number
  wording: string
  category_id: number
  price: number
  promotional_price: number | null
  weight: string | number
  available_in_box: boolean
  stock_quantity: number | null
  illustration: string | null
  category?: { id: number; wording: string }
}

interface ApiCategory {
  id: number
  wording: string
  slices_count?: number
  illustration: string | null
}

/** Résout l'image affichée : asset local par id d'abord, sinon l'illustration API. */
function resolveImage(id: number, apiIllustration: string | null, localMap: Map<number, string>): string {
  const local = localMap.get(id)
  if (local) return local
  if (!apiIllustration) return ''
  // base64 → tel quel ; sinon chemin disque servi par la route publique /image/{path}
  return apiIllustration.startsWith('data:') ? apiIllustration : `image/${apiIllustration}`
}

function normalizeSlice(r: ApiSlice): Slice {
  return {
    id: r.id,
    name: r.wording,
    categoryId: r.category_id,
    category: r.category?.wording ?? localCategoryNameById.get(r.category_id) ?? '',
    price: Number(r.price),
    weight: Number(r.weight),
    availableInBox: !!r.available_in_box,
    image: resolveImage(r.id, r.illustration, localImageBySliceId),
    promotionalPrice: r.promotional_price ?? null,
    stockQuantity: r.stock_quantity ?? null,
  }
}

function normalizeCategory(r: ApiCategory): Category {
  return {
    id: r.id,
    name: categoryLabel(r.wording),
    slicesCount: r.slices_count ?? 0,
    image: resolveImage(r.id, r.illustration, localImageByCategoryId),
  }
}

export interface ApiCatalog {
  slices: Slice[]
  categories: Category[]
}

/** Récupère et normalise le catalogue complet (61 découpes tiennent en 1 page). */
export async function fetchApiCatalog(): Promise<ApiCatalog> {
  const [slicesRes, catsRes] = await Promise.all([
    api.get('/get-slices', { params: { per_page: 100 } }),
    api.get('/get-categories-with-slices-count', { params: { per_page: 100 } }),
  ])
  const sliceRows: ApiSlice[] = slicesRes.data?.data ?? slicesRes.data ?? []
  const catRows: ApiCategory[] = catsRes.data?.data ?? catsRes.data ?? []
  return {
    slices: sliceRows.map(normalizeSlice),
    categories: catRows.map(normalizeCategory),
  }
}
