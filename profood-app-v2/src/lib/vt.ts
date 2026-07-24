import { flushSync } from 'react-dom'

/**
 * Navigation avec View Transition : les éléments qui portent le même
 * `view-transition-name` des deux côtés (ex. photo de la carte produit →
 * photo de la fiche) se MORPHENT d'un écran à l'autre.
 * Repli : navigation normale si l'API manque ou si l'utilisateur préfère
 * réduire les animations.
 */
export function withViewTransition(update: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typeof doc.startViewTransition === 'function' && !reduced) {
    // flushSync : le DOM doit refléter la nouvelle route dans le callback
    // pour que le navigateur capture l'état « après ».
    doc.startViewTransition(() => flushSync(update))
  } else {
    update()
  }
}

/** Nom de transition partagé d'une photo de découpe (unique par écran). */
export function sliceVtName(id: number): React.CSSProperties {
  return { viewTransitionName: `slice-${id}` } as React.CSSProperties
}
