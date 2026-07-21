/**
 * Zones de livraison Dakar — frais par commune, avec franco (gratuit au-dessus
 * d'un seuil). Aligné sur le modèle « frais par zone » de l'app manager.
 * À terme fourni par l'API (le montant fait toujours foi côté serveur) ; ici
 * en table statique pour rendre le tunnel de commande fonctionnel.
 */
export interface DeliveryZone {
  id: string
  commune: string
  fee: number
  /** Livraison offerte à partir de ce montant de panier (FCFA). */
  franco: number
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'plateau', commune: 'Dakar-Plateau', fee: 1500, franco: 40000 },
  { id: 'medina', commune: 'Médina', fee: 1500, franco: 40000 },
  { id: 'grand-dakar', commune: 'Grand Dakar', fee: 2000, franco: 45000 },
  { id: 'point-e', commune: 'Point E / Fann', fee: 2000, franco: 45000 },
  { id: 'ouakam', commune: 'Ouakam', fee: 2500, franco: 50000 },
  { id: 'ngor', commune: 'Ngor / Almadies', fee: 3000, franco: 50000 },
  { id: 'parcelles', commune: 'Parcelles Assainies', fee: 3000, franco: 55000 },
  { id: 'guediawaye', commune: 'Guédiawaye', fee: 3500, franco: 60000 },
  { id: 'pikine', commune: 'Pikine', fee: 3500, franco: 60000 },
  { id: 'rufisque', commune: 'Rufisque', fee: 4500, franco: 70000 },
]

export function zoneById(id: string | undefined): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id)
}

/** Frais applicables : 0 si le sous-total atteint le franco de la zone. */
export function deliveryFee(zone: DeliveryZone | undefined, subtotal: number): number {
  if (!zone) return 0
  return subtotal >= zone.franco ? 0 : zone.fee
}
