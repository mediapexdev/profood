/**
 * ProfilePage — displays driver information and account settings.
 *
 * Sections:
 *   1. Avatar + name + phone
 *   2. Personal info card (email, phone)
 *   3. Settings menu (language, notifications, help, about)
 *   4. Logout button
 *
 * Uses useAuth to read the driver object and to handle logout.
 */

import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'

interface MenuItemProps {
  icon: string
  label: string
  detail?: string
  onClick?: () => void
}

function MenuItem({ icon, label, detail, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size="sm" className="text-primary" />
      </div>
      <span className="flex-1 text-sm font-semibold text-gray-800">{label}</span>
      {detail && (
        <span className="text-xs text-gray-400 mr-1">{detail}</span>
      )}
      <Icon name="chevron_right" size="sm" className="text-gray-300" />
    </button>
  )
}

export function ProfilePage() {
  const { driver, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = driver?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  return (
    <div className="min-h-dvh bg-background-light pb-nav">
      <PageHeader title="Profil" />

      <main className="px-4 pt-5  flex flex-col gap-5">

        {/* ── Avatar + name ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 py-4">
          {driver?.avatar ? (
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-20 h-20 rounded-full object-cover border-3 border-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{driver?.name}</h2>
            <p className="text-sm text-gray-500">{driver?.phone}</p>
          </div>
        </div>

        {/* ── Informations personnelles ────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">
            Informations personnelles
          </h3>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
            <Icon name="mail" size="sm" className="text-gray-400" />
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{driver?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Icon name="phone" size="sm" className="text-gray-400" />
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Téléphone</p>
              <p className="text-sm font-semibold text-gray-800">{driver?.phone}</p>
            </div>
          </div>
        </div>

        {/* ── Paramètres ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">
            Paramètres
          </h3>
          <MenuItem icon="language" label="Langue" detail="Français" />
          <MenuItem icon="notifications" label="Notifications" />
          <MenuItem icon="help" label="Aide & Support" />
          <MenuItem icon="info" label="À propos" detail="v1.0.0" />
        </div>

        {/* ── Déconnexion ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 active:scale-[0.98] transition text-sm"
        >
          <Icon name="logout" size="md" />
          Se déconnecter
        </button>
      </main>
    </div>
  )
}
