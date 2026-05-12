import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import BoxTypesPage from './pages/boxes/BoxTypesPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import SignInPage from './pages/auth/singnin/SignInPage';
import PasswordResetPage from './pages/auth/password-reset/PasswordResetPage';
import ProductsPage from './pages/products/ProductsPage';
import CustomersPage from './pages/customers/CustomersPage';
import NewCustomerPage from './pages/customers/NewCustomerPage';
import CustomerDataViewPage from './pages/customers/CustomerDataViewPage';
import CustomerDataEditingPage from './pages/customers/CustomerDataEditingPage';
import PromotionsPage from './pages/promotions/PromotionsPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailsPage from './pages/orders/OrderDetailsPage';
import OrderInvoicePage from './pages/orders/OrderInvoicePage';
import OrderReceiptPage from './pages/orders/OrderReceiptPage';
import PublicReceiptPage from './pages/orders/PublicReceiptPage';
import SettingsPage from './pages/settings/SettingsPage';
import AccountPage from './pages/account/AccountPage';
import UsersPage from './pages/settings/users/UsersPage';
import NewUserPage from './pages/settings/users/NewUserPage';
import UserDataViewPage from './pages/settings/users/UserDataViewPage';
import UserDataEditingPage from './pages/settings/users/UserDataEditingPage';
import LivreursPage from './pages/settings/livreurs/LivreursPage';
import NewLivreurPage from './pages/settings/livreurs/NewLivreurPage';
import LivreurDataViewPage from './pages/settings/livreurs/LivreurDataViewPage';
import LivreurDataEditingPage from './pages/settings/livreurs/LivreurDataEditingPage';
import { useUserInfosContext } from './pages/account/components/contexts/UserInfosProvider';

import './App.css';

/**
 * 
 * @returns 
 */
function App() {
    /**
     * 
     */
    const { userRole } = useUserInfosContext();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <DashboardPage />
                        </RequireAuth>
                    }
                />
                <Route path="/connexion" element={<SignInPage />} />
                <Route path="/reinitialisation-mot-de-passe" element={<PasswordResetPage />} />
                <Route path="/recu/:id" element={<PublicReceiptPage />} />
                <Route
                    path="/tableau-de-bord"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <DashboardPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/categories"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <CategoriesPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/boxes/types"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <BoxTypesPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/produits"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <ProductsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/commandes"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <OrdersPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/commandes/:id"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <OrderDetailsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/commandes/:id/facture"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <OrderInvoicePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/commandes/:id/recu"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <OrderReceiptPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/clients"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <CustomersPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/clients/nouveau"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <NewCustomerPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/clients/vue/:id"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <CustomerDataViewPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/clients/edition/:id"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <CustomerDataEditingPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/promotions"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <PromotionsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/parametres"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <SettingsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/parametres/compte"
                    element={
                        <RequireAuth redirectTo="/connexion">
                            <AccountPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/parametres/utilisateurs"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <UsersPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/utilisateurs/nouveau"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <NewUserPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/utilisateurs/vue/:id"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <UserDataViewPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/utilisateurs/edition/:id"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <UserDataEditingPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/livreurs"
                    element={
                        (['admin', 'super admin', 'manager'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <LivreursPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/livreurs/nouveau"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <NewLivreurPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/livreurs/vue/:id"
                    element={
                        (['admin', 'super admin', 'manager'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <LivreurDataViewPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route
                    path="/parametres/livreurs/edition/:id"
                    element={
                        (['admin', 'super admin'].includes(userRole?.wording.toLowerCase() as string))
                        ?
                        <RequireAuth redirectTo="/connexion">
                            <LivreurDataEditingPage />
                        </RequireAuth>
                        :
                        <NotFoundPage />
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

/**
 * 
 */
interface RequireAuthProps {
    children: React.ReactNode;
    redirectTo: string;
}

/**
 * 
 * @param {*} param0 
 * @returns 
 */
function RequireAuth({ children, redirectTo }: RequireAuthProps) {

    const isAuthenticated = localStorage.getItem("token");

    return isAuthenticated !== null ? <React.Fragment>{children}</React.Fragment> : <Navigate to={redirectTo} />;
}

export default App;
