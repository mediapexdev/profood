import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useCart } from '../../contexts/CartContext'
import { haptic } from '../../lib/haptics'

interface Tab { to: string; label: string; icon: string; end?: boolean }

const TABS: Tab[] = [
  { to: '/', label: 'Boutique', icon: 'storefront', end: true },
  { to: '/composer', label: 'Composer', icon: 'takeout_dining' },
  { to: '/panier', label: 'Panier', icon: 'shopping_bag' },
  { to: '/compte', label: 'Compte', icon: 'person' },
]

/**
 * Barre d'onglets — mobile uniquement (masquée en ≥768px où la nav passe en
 * haut, cf. AppBar). Le signal le plus net « app native ».
 */
export function BottomNav() {
  const { count } = useCart()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-sable no-select"
      style={{ paddingBottom: 'var(--sai-bottom)' }}
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              onClick={() => haptic('light')}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 h-[60px] transition-colors ${isActive ? 'text-terre' : 'text-taupe'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon name={tab.icon} fill={isActive} size={26} />
                    {tab.to === '/panier' && count > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-terre text-white text-[10px] font-bold flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
