import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useCart } from '../../contexts/CartContext'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../i18n'

interface Tab { to: string; label: string; icon: string; end?: boolean }

/**
 * Barre d'onglets — mobile uniquement (masquée en ≥768px où la nav passe en
 * haut, cf. AppBar). Dock FLOTTANT : pilule détachée des bords, flou d'arrière-
 * plan, bulle « ressort » qui glisse sous l'onglet actif, icône qui se remplit
 * et remonte d'un cran. Tout en CSS (transitions), neutralisé par
 * prefers-reduced-motion via le kill-switch global.
 */
export function BottomNav() {
  const { t } = useI18n()
  const { count } = useCart()
  const { pathname } = useLocation()

  const TABS: Tab[] = [
    { to: '/', label: t('nav.home'), icon: 'home', end: true },
    { to: '/boutique', label: t('nav.shop'), icon: 'storefront' },
    { to: '/composer', label: t('nav.composer'), icon: 'takeout_dining' },
    { to: '/panier', label: t('nav.cart'), icon: 'shopping_bag' },
    { to: '/compte', label: t('nav.account'), icon: 'person' },
  ]

  // Index actif pour positionner la bulle (aligné sur la logique NavLink).
  const activeIdx = TABS.findIndex((tab) =>
    tab.end ? pathname === tab.to : pathname.startsWith(tab.to),
  )

  return (
    <nav
      className="md:hidden fixed left-3 right-3 z-50 no-select"
      style={{ bottom: 'calc(var(--sai-bottom) + 12px)' }}
    >
      <ul className="relative flex items-stretch h-16 rounded-[32px] bg-surface/85 backdrop-blur-xl border border-sable shadow-card-hover">
        {/* Bulle de l'onglet actif : glisse d'un onglet à l'autre (ressort). */}
        {activeIdx >= 0 && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 grid place-items-center transition-transform duration-[380ms]"
            style={{
              width: `${100 / TABS.length}%`,
              transform: `translateX(${activeIdx * 100}%)`,
              transitionTimingFunction: 'var(--ease-spring)',
            }}
          >
            <span className="w-[52px] h-[52px] rounded-full bg-terre/15 border border-terre/20" />
          </span>
        )}

        {TABS.map((tab) => (
          <li key={tab.to} className="relative flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              onClick={() => haptic('light')}
              className="group flex flex-col items-center justify-center gap-[3px] h-full"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative transition-[transform,color] duration-[380ms] group-active:scale-75 ${
                      isActive ? 'text-terre -translate-y-[3px] scale-110' : 'text-taupe translate-y-[3px]'
                    }`}
                    style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                  >
                    <Icon name={tab.icon} fill={isActive} size={24} />
                    {tab.to === '/panier' && count > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-terre text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface animate-pop">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-bold tracking-wide transition-[opacity,transform] duration-300 ${
                      isActive ? 'text-terre opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
