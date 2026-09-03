/**
 * App — routeur et structure de navigation.
 *
 *   / (AppLayout : AppBar responsive + contenu + BottomNav mobile)
 *     ├── /            → AccueilPage (vitrine)
 *     ├── /boutique    → BoutiquePage
 *     ├── /box         → BoxesPage (box prédéfinies ; /composer redirige ici)
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
import { WhatsAppWidget } from './components/WhatsAppWidget'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './i18n'
import { AuthProvider } from './contexts/AuthContext'
import { CatalogProvider } from './contexts/CatalogContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { AccueilPage } from './pages/AccueilPage'
import { BoutiquePage } from './pages/BoutiquePage'
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
import { PaiementRetourPage } from './pages/PaiementRetourPage'
import { BoxesPage, BoxDetailPage } from './pages/BoxPage'
import { ProfilPage } from './pages/ProfilPage'

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
      <I18nProvider>
      <AuthProvider>
        <CatalogProvider>
        <FavoritesProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<AccueilPage />} />
                  <Route path="/boutique" element={<BoutiquePage />} />
                  {/* Composeur libre masqué : l'offre se limite aux box prédéfinies,
                      pilotées depuis l'app manager (prix/capacité maîtrisés). */}
                  <Route path="/composer" element={<Navigate to="/box" replace />} />
                  <Route path="/box" element={<BoxesPage />} />
                  <Route path="/panier" element={<PanierPage />} />
                  <Route path="/compte" element={<ComptePage />} />
                </Route>
                <Route path="/produit/:id" element={<ProduitPage />} />
                <Route path="/box/:id" element={<BoxDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation/:token" element={<ConfirmationPage />} />
                <Route path="/suivi/:token" element={<SuiviPage />} />
                <Route path="/commandes" element={<CommandesPage />} />
                <Route path="/favoris" element={<FavorisPage />} />
                <Route path="/adresses" element={<AdressesPage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="/connexion" element={<ConnexionPage />} />
                <Route path="/inscription" element={<InscriptionPage />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePage />} />
                {/* Retours PayTech — chemins construits côté serveur (client_app_url). */}
                <Route path="/guest-order-success/:hash" element={<PaiementRetourPage outcome="success" />} />
                <Route path="/orders/successful-order/:hash" element={<PaiementRetourPage outcome="success" />} />
                <Route path="/orders/cancelled-order/:hash" element={<PaiementRetourPage outcome="cancelled" />} />
                <Route path="/views/cart" element={<Navigate to="/panier" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <WhatsAppWidget />
            </BrowserRouter>
          </CartProvider>
        </FavoritesProvider>
        </CatalogProvider>
      </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
