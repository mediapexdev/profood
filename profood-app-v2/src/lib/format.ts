/** Formatage FCFA : espace fine comme séparateur de milliers, jamais de décimale. */
export function fmtFcfa(n: number): string {
  return n.toLocaleString('fr-FR').replace(/ |,/g, ' ') + ' FCFA'
}
