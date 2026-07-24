import { useEffect, useRef, useState } from 'react'

/**
 * Révélation au scroll : passe `visible` à true une seule fois quand
 * l'élément entre dans le viewport (seuil ~15 %), puis se déconnecte.
 * Sans IntersectionObserver (vieux WebView), le contenu est montré d'emblée.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, visible }
}
