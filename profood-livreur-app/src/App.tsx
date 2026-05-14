/**
 * App — root component that owns the router and top-level route structure.
 *
 * Route layout:
 *   /login                       — public, no chrome
 *   / (authenticated)
 *     ├── / (AppLayout)          — routes that display BottomNav
 *     │   ├── /                  → DashboardPage
 *     │   ├── /tournee           → TourListPage
 *     │   ├── /historique        → HistoryPage
 *     │   ├── /revenus           → PlaceholderPage (Revenus)
 *     │   ├── /profil            → ProfilePage
 *     │   └── /notifications     → NotificationsPage
 *     ├── /tournee/carte         → MapPage      (full-screen, no BottomNav)
 *     ├── /livraison/:id         → DeliveryDetailsPage
 *     ├── /livraison/:id/confirmation → ConfirmationPage
 *     └── /livraison/:id/signalement  → ReportIssuePage
 *   * (catch-all)                → redirect to /
 *
 * AuthGuard reads the driver from useAuth: any unauthenticated visitor is
 * bounced to /login with a `replace` so the back-button does not loop.
 *
 * AppLayout wraps tab-bar routes with a persistent BottomNav rendered below
 * the page content via an <Outlet />. Full-screen routes (map, delivery flow)
 * sit outside AppLayout so they can own their entire viewport.
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { LocationTracker } from './components/LocationTracker'
import { UnlockGate } from './components/UnlockGate'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TourListPage } from './pages/TourListPage'
import { MapPage } from './pages/MapPage'
import { DeliveryDetailsPage } from './pages/DeliveryDetailsPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ReportIssuePage } from './pages/ReportIssuePage'
import { HistoryPage } from './pages/HistoryPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'

/**
 * AuthGuard — protects all routes nested beneath it.
 *
 * The guard derives authentication from whether the driver object is present
 * rather than a separate boolean so we stay consistent with the useAuth
 * contract (driver is null when logged out, Driver when logged in).
 *
 * Using `replace` on the Navigate prevents the browser from pushing /login
 * onto the history stack, so pressing Back after login does not loop the user
 * back to the login screen.
 */
function BootstrapSplash() {
  return (
    <div className="min-h-dvh bg-background-light flex flex-col items-center justify-center gap-3">
      <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Chargement…</p>
    </div>
  )
}

function AuthGuard() {
  const { driver, bootstrapping } = useAuth()
  // Avoid a brief Navigate-to-login flicker while the async hydration from
  // @capacitor/preferences resolves on a cold start.
  if (bootstrapping) return <BootstrapSplash />
  if (driver === null) return <Navigate to="/login" replace />
  return (
    <UnlockGate>
      <LocationTracker />
      <Outlet />
    </UnlockGate>
  )
}

/**
 * AppLayout — shared shell for all tab-bar routes.
 *
 * Renders the page content via <Outlet /> and attaches the persistent
 * BottomNav below it. Pages that need the full viewport (map, confirmation,
 * issue reporting) are intentionally placed outside this layout.
 */
function AppLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public route — accessible without a session */}
        <Route path="/login" element={<LoginPage />} />

        {/* Everything below requires an authenticated driver */}
        <Route element={<AuthGuard />}>

          {/* Tab-bar routes: rendered inside AppLayout so BottomNav is always visible */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tournee" element={<TourListPage />} />
            <Route path="/historique" element={<HistoryPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Full-screen routes: no BottomNav — they manage their own navigation */}
          <Route path="/tournee/carte" element={<MapPage />} />
          <Route path="/livraison/:id" element={<DeliveryDetailsPage />} />
          <Route path="/livraison/:id/confirmation" element={<ConfirmationPage />} />
          <Route path="/livraison/:id/signalement" element={<ReportIssuePage />} />

        </Route>

        {/* Catch-all: send unknown paths back to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
