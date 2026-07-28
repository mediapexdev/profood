import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useCart } from '../../contexts/CartContext'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../i18n'

interface Tab { to: string; label: string; icon: string; end?: boolean }

/** Poids flex de l'onglet actif (les inactifs valent 1) — il s'élargit. */
const GROW = 2.1
/** Marge interne horizontale du rail (px), reprise dans la géométrie. */
const RAIL_PAD = 6
const SPRING = 'var(--ease-spring)'

/**
 * Barre d'onglets — mobile uniquement (masquée en ≥768px, cf. AppBar).
 * Dock flottant « pilule extensible » :
 *   - l'onglet actif s'élargit (flex-grow animé) et révèle son libellé À CÔTÉ
 *     de l'icône, dans une bulle terre pleine qui glisse ET s'étire (ressort) ;
 *   - la géométrie de la bulle est calculée (poids flex connus), donc bulle et
 *     cellules s'animent avec la même courbe : elles restent verrouillées ;
 *   - le dock s'efface quand on fait défiler vers le bas et revient dès qu'on
 *     remonte (écoute en capture du scroll de la coquille .app-scroll) ;
 *   - icône « jelly » à l'activation, compression au toucher, badge panier.
 * Tout en CSS ; neutralisé par prefers-reduced-motion (kill-switch global).
 */
export function BottomNav() {
  const { t } = useI18n()
  const { count } = useCart()
  const { pathname } = useLocation()

  const TABS: Tab[] = [
    { to: '/', label: t('nav.home'), icon: 'home', end: true },
    { to: '/boutique', label: t('nav.shop'), icon: 'storefront' },
    { to: '/box', label: t('nav.boxes'), icon: 'takeout_dining' },
    { to: '/panier', label: t('nav.cart'), icon: 'shopping_bag' },
    { to: '/compte', label: t('nav.account'), icon: 'person' },
  ]

  const activeIdx = TABS.findIndex((tab) =>
    tab.end ? pathname === tab.to : pathname.startsWith(tab.to),
  )

  // Largeur du rail (pour la géométrie de la bulle), suivie au resize.
  const railRef = useRef<HTMLUListElement>(null)
  const [railW, setRailW] = useState(0)
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ro = new ResizeObserver(() => setRailW(rail.clientWidth))
    ro.observe(rail)
    setRailW(rail.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Masquage au défilement : on accumule le delta (hystérésis) pour éviter
  // tout papillotement ; toujours ré-affiché près du haut et au changement
  // de page. Écoute en capture : le scroller est le <main> de chaque page.
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const acc = useRef(0)
  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target
      if (!(el instanceof HTMLElement) || !el.classList.contains('app-scroll')) return
      const y = el.scrollTop
      const delta = y - lastY.current
      lastY.current = y
      if (y < 60) { acc.current = 0; setHidden(false); return }
      acc.current = Math.sign(delta) === Math.sign(acc.current) ? acc.current + delta : delta
      if (acc.current > 26) setHidden(true)
      else if (acc.current < -14) setHidden(false)
    }
    document.addEventListener('scroll', onScroll, true)
    return () => document.removeEventListener('scroll', onScroll, true)
  }, [])
  useEffect(() => { lastY.current = 0; acc.current = 0; setHidden(false) }, [pathname])

  // Géométrie de la bulle : cellules en flex-basis 0 → largeur ∝ poids.
  const inner = Math.max(0, railW - RAIL_PAD * 2)
  const weights = TABS.length - 1 + GROW
  const bubbleW = (inner * GROW) / weights
  const bubbleX = RAIL_PAD + (inner * (activeIdx < 0 ? 0 : activeIdx)) / weights

  return (
    <nav
      className="md:hidden fixed left-3 right-3 z-50 no-select transition-transform duration-[350ms]"
      style={{
        bottom: 'calc(var(--sai-bottom) + 12px)',
        transform: hidden ? 'translateY(calc(100% + var(--sai-bottom) + 16px))' : 'translateY(0)',
        transitionTimingFunction: hidden ? 'var(--ease)' : SPRING,
      }}
    >
      <ul
        ref={railRef}
        className="dock relative flex items-stretch h-16 rounded-[32px] bg-surface/80 backdrop-blur-2xl border border-sable"
      >
        {/* Bulle pleine : glisse et s'étire vers l'onglet actif. */}
        {activeIdx >= 0 && railW > 0 && (
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-terre shadow-[0_6px_18px_-6px_rgba(240,124,36,.6)] transition-[transform,width] duration-[380ms]"
            style={{ width: bubbleW, transform: `translateX(${bubbleX}px)`, transitionTimingFunction: SPRING }}
          />
        )}

        {TABS.map((tab, i) => {
          const isActive = i === activeIdx
          return (
            <li
              key={tab.to}
              className="relative min-w-0 transition-[flex-grow] duration-[380ms]"
              style={{ flex: `${isActive ? GROW : 1} 1 0%`, transitionTimingFunction: SPRING }}
            >
              <NavLink
                to={tab.to}
                end={tab.end}
                onClick={() => haptic('light')}
                className="group relative z-[1] flex h-full items-center justify-center gap-1.5 px-1"
              >
                <span
                  key={isActive ? 'on' : 'off'}
                  className={`relative shrink-0 transition-[color,transform] duration-300 group-active:scale-90 ${
                    isActive ? 'text-white tab-jelly' : 'text-taupe'
                  }`}
                >
                  <Icon name={tab.icon} fill={isActive} size={23} />
                  {tab.to === '/panier' && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-terre text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface animate-pop">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </span>
                <span
                  className={`whitespace-nowrap overflow-hidden text-[12px] font-bold tracking-wide transition-[max-width,opacity,transform] duration-[380ms] ${
                    isActive ? 'max-w-[88px] opacity-100 translate-x-0 text-white' : 'max-w-0 opacity-0 -translate-x-1.5'
                  }`}
                  style={{ transitionTimingFunction: SPRING }}
                >
                  {tab.label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
