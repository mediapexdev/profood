/**
 * App — routeur et structure de navigation.
 *
 *   / (AppLayout : AppBar responsive + contenu + BottomNav mobile)
 *     ├── /            → BoutiquePage
 *     ├── /composer    → ComposerPage
 *     ├── /panier      → PanierPage
 *     └── /compte      → ComptePage
 *   /produit/:id       → ProduitPage (plein écran, sans tab-bar)
 *   *                  → redirection vers /
 *
 * La nav (AppBar en haut, BottomNav en bas sur mobile) persiste entre les
 * routes via <Outlet/> ; seul le contenu transitionne (cf. <Page/>).
 */
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BottomNav } from './components/shell/BottomNav'
import { ThemeProvider } from './contexts/ThemeContext'
import { CartProvider } from './contexts/CartContext'
import { BoutiquePage } from './pages/BoutiquePage'
import { ComposerPage } from './pages/ComposerPage'
import { PanierPage } from './pages/PanierPage'
import { ComptePage } from './pages/ComptePage'
import { ProduitPage } from './pages/ProduitPage'

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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  )
}
