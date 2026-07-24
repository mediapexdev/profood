import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useTheme } from '../../contexts/ThemeContext'
import { useCart } from '../../contexts/CartContext'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../i18n'
import { withViewTransition } from '../../lib/vt'

/**
 * Barre supérieure fixe, responsive :
 *  - mobile : titre (ou retour) + actions, compacte, calée sur la safe-area ;
 *  - desktop (≥768px) : marque + liens de navigation + actions (vraie appli web).
 */
export function AppBar({ title, back = false, brand = false }: { title: string; back?: boolean; brand?: boolean }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()
  const { count } = useCart()

  const LINKS = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/boutique', label: t('nav.shop') },
    { to: '/box', label: t('nav.boxes') },
    { to: '/composer', label: t('nav.composer') },
    { to: '/panier', label: t('nav.cart') },
    { to: '/compte', label: t('nav.account') },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur border-b border-sable no-select"
      style={{ paddingTop: 'var(--sai-top)' }}
    >
      <div className="mx-auto max-w-6xl h-14 md:h-16 flex items-center gap-3 px-3 md:px-6">
        {/* Mobile : retour ou titre */}
        <div className="flex items-center gap-2 md:hidden flex-1 min-w-0">
          {back && (
            <button onClick={() => { haptic('light'); withViewTransition(() => navigate(-1)) }} className="w-10 h-10 -ml-1 grid place-items-center rounded-full active:bg-creme-dark text-ink" aria-label={t('common.back')}>
              <Icon name="arrow_back_ios_new" size={22} />
            </button>
          )}
          {brand ? (
            <img src="/logo-profood.png" alt={title} className="h-6 w-auto" />
          ) : (
            <h1 className="text-[19px] font-extrabold truncate">{title}</h1>
          )}
        </div>

        {/* Desktop : marque + liens */}
        <button onClick={() => navigate('/')} aria-label="PROFOOD" className="hidden md:block shrink-0">
          <img src="/logo-profood.png" alt="PROFOOD" className="h-7 w-auto" />
        </button>
        <nav className="hidden md:flex items-center gap-1 ml-6 flex-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-[14px] font-bold transition-colors ${isActive ? 'text-terre' : 'text-taupe hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions communes */}
        <button onClick={toggle} aria-label={t('appbar.toggleTheme')} className="w-10 h-10 grid place-items-center rounded-full active:bg-creme-dark text-ink">
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={22} />
        </button>
        <button onClick={() => navigate('/panier')} aria-label={t('nav.cart')} className="hidden md:grid w-10 h-10 place-items-center rounded-full active:bg-creme-dark text-ink relative">
          <Icon name="shopping_bag" size={22} />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-terre text-white text-[10px] font-bold grid place-items-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
