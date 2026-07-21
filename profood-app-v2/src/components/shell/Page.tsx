import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Enveloppe de page : applique la coquille scrollable et une transition
 * d'entrée directionnelle (glissement depuis la droite en navigation avant,
 * depuis la gauche au retour) — le header et la tab-bar, fixes, ne bougent pas.
 * C'est ce qui donne le ressenti « app » que fournissait Ionic gratuitement.
 */
export function Page({ children, noTabbar = false }: { children: React.ReactNode; noTabbar?: boolean }) {
  const location = useLocation()
  const navType = useNavigationType() // 'PUSH' | 'POP' | 'REPLACE'
  const anim = navType === 'POP' ? 'page-pop' : 'page-push'

  return (
    <main className={`app-scroll ${noTabbar ? 'no-tabbar' : ''}`}>
      <div key={location.pathname} className={anim}>
        {children}
      </div>
    </main>
  )
}
