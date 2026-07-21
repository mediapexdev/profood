/**
 * App — routeur et structure de navigation.
 *
 *   / (AppLayout : AppBar responsive + contenu + BottomNav mobile)
 *     ├── /            → BoutiquePage
 *     ├── /composer    → ComposerPage
 *     ├── /panier      → PanierPage
 *     └── /compte      → ComptePage
 *   Plein écran (sans tab-bar, avec retour) :
 *   /produit/:id           → ProduitPage
 *   /checkout              → CheckoutPage (tunnel invité)
 *   /confirmation/:token   → ConfirmationPage
 *   /suivi/:token          → SuiviPage (chronologie 4 états)
 *   /commandes             → CommandesPage (historique local)
 *   /favoris               → FavorisPage (découpes favorites)
 *   /adresses              → AdressesPage (adresses enregistrées)
 *   /connexion             → ConnexionPage
 *   /inscription           → InscriptionPage
 *   /mot-de-passe-oublie   → MotDePasseOubliePage
 *   *                      → redirection vers /
 *
 * La nav (AppBar en haut, BottomNav en bas sur mobile) persiste entre les
 * routes via <Outlet/> ; seul le contenu transitionne (cf. <Page/>).
 */
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BottomNav } from './components/shell/BottomNav'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { BoutiquePage } from './pages/BoutiquePage'
import { ComposerPage } from './pages/ComposerPage'
import { PanierPage } from './pages/PanierPage'
import { ComptePage } from './pages/ComptePage'
import { ProduitPage } from './pages/ProduitPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { SuiviPage } from './pages/SuiviPage'
import { CommandesPage } from './pages/CommandesPage'
import { FavorisPage } from './pages/FavorisPage'
import { AdressesPage } from './pages/AdressesPage'
import { ConnexionPage } from './pages/ConnexionPage'
import { InscriptionPage } from './pages/InscriptionPage'
import { MotDePasseOubliePage } from './pages/MotDePasseOubliePage'

function AppLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<BoutiquePage />} />
                  <Route path="/composer" element={<ComposerPage />} />
                  <Route path="/panier" element={<PanierPage />} />
                  <Route path="/compte" element={<ComptePage />} />
                </Route>
                <Route path="/produit/:id" element={<ProduitPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation/:token" element={<ConfirmationPage />} />
                <Route path="/suivi/:token" element={<SuiviPage />} />
                <Route path="/commandes" element={<CommandesPage />} />
                <Route path="/favoris" element={<FavorisPage />} />
                <Route path="/adresses" element={<AdressesPage />} />
                <Route path="/connexion" element={<ConnexionPage />} />
                <Route path="/inscription" element={<InscriptionPage />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
