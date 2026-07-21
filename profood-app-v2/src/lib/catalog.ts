/**
 * Catalogue réel, issu du package de livraison PROFOOD (données du site
 * vitrine). À terme lu depuis l'API Laravel ; ici en JSON statique.
 */
import slicesData from '../data/slices.json'
import boxesData from '../data/boxes.json'
import categoriesData from '../data/categories.json'

export interface Slice {
  id: number
  name: string
  categoryId: number
  category: string
  price: number
  weight: number
  availableInBox: boolean
  image: string
  /** Champs « live » (présents quand le catalogue vient de l'API). */
  promotionalPrice?: number | null
  stockQuantity?: number | null
}

export interface Box {
  id: number
  name: string
  price: number
  capacity: number
  image: string
}

export interface Category {
  id: number
  name: string
  slicesCount: number
  image: string
}

export const SLICES: Slice[] = slicesData as Slice[]
export const BOXES: Box[] = (boxesData as Box[]).slice().sort((a, b) => a.capacity - b.capacity)
export const CATEGORIES: Category[] = categoriesData as Category[]

/** La mer est retirée : on ne garde que Bœuf / Mouton / Volaille (déjà le cas ici). */
export const MEAT_CATEGORY_IDS = [1, 2, 3] as const

/** Libellé d'affichage soigné (les données brutes écrivent « Boeuf »). */
export function categoryLabel(name: string): string {
  return name === 'Boeuf' ? 'Bœuf' : name
}

export const PRICE_PER_CUT = 14100

export function slicesByCategory(categoryId: number): Slice[] {
  return SLICES.filter((s) => s.categoryId === categoryId)
}
