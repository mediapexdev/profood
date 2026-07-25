/**
 * Rechargement automatique d'une image en échec.
 *
 * Au premier chargement, le navigateur peut abandonner des requêtes d'images
 * quand la connexion est saturée (mutualisé LWS : gros catalogue + rafale
 * d'images au-dessus de la fold). Une image en erreur ne se recharge jamais
 * d'elle-même : on retente jusqu'à 2 fois, avec un délai croissant et un
 * cache-buster pour contourner une éventuelle réponse d'erreur mise en cache.
 */
const MAX_RETRIES = 2

export function retryImgOnError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget
  const tried = Number(img.dataset.retry ?? 0)
  if (tried >= MAX_RETRIES || !img.src || img.src.startsWith('data:')) return
  img.dataset.retry = String(tried + 1)
  const base = img.src.replace(/[?&]imgretry=\d+$/, '')
  window.setTimeout(() => {
    img.src = `${base}${base.includes('?') ? '&' : '?'}imgretry=${tried + 1}`
  }, 900 * (tried + 1))
}
