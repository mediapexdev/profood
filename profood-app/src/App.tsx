import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import MainMenu from './pages/layout/navigation/MainMenu';
import DesktopNav from './components/layout/DesktopNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import BoxTypesPage from './pages/box-types/BoxTypesPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import BoxTypeSlicesPage from './pages/slices/box-type/BoxTypeSlicesPage';
import CategorySlicesPage from './pages/slices/category/CategorySlicesPage';
import TabsMenu from './pages/layout/navigation/TabsMenu';
import SignInPage from './pages/auth/singnin/SignInPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import PasswordResetPage from './pages/auth/password-reset/PasswordResetPage';
import LanguagesPage from './pages/languages/LanguagesPage';
import FAQPage from './pages/useful-information/FAQ/FAQPage';
import PrivacyPolicyPage from './pages/useful-information/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/useful-information/TermsAndConditionsPage';
import ProfoodBoxAndServices from './pages/useful-information/FAQ/ProfoodBoxAndServices';
import OrderAndDelivery from './pages/useful-information/FAQ/OrderAndDelivery';
import AccountAndLogin from './pages/useful-information/FAQ/AccountAndLogin';
import PaymentsAndRefunds from './pages/useful-information/FAQ/PaymentsAndRefunds';
import QualityAndHygiene from './pages/useful-information/FAQ/QualityAndHygiene';
import CancelledOrderPage from './pages/orders/CancelledOrderPage';
import SuccessfulOrderPage from './pages/orders/SuccessfulOrderPage';
import GuestOrderSuccess from './pages/orders/GuestOrderSuccess';
import OrderDetailsPage from './pages/orders/details/OrderDetailsPage';
import SearchPage from './pages/search/SearchPage';
import GuestCheckoutPage from './pages/checkout/GuestCheckoutPage';
// import NotFoundPage from './pages/errors/NotFoundPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Personal CSS */
import './styles/display.css';
import './styles/font.css';
import './styles/margin.css';
import './styles/padding.css';
import './styles/size.css';
import './styles/text.css';

import './styles/global.css';
import './styles/animations.css';
import './styles/form.css';

/* Responsive styles for desktop layout support */
import './theme/responsive.css';

/**
 *
 */
setupIonicReact();

/**
 * 
 * @returns 
 */
const App: React.FC = () => {

    return (
        <IonApp>
            {/* begin::ReactRouter */}
            <IonReactRouter>
                {/* begin::DesktopNav - Desktop header navigation (hidden on mobile) */}
                <DesktopNav />
                {/* end::DesktopNav */}
                {/* begin::SplitPane */}
                <IonSplitPane
                    when='xl'
                    contentId="main"
                >
                    {/* begin::MainMenu */}
                    <MainMenu />
                    {/* end::MainMenu */}
                    {/* begin::RouterOutlet */}
                    <IonRouterOutlet id="main">
                        {/* Important route for tabs navigation! */}
                        <Route
                            path="/views"
                            component={TabsMenu}
                        />
                        {/* and here are defined every other route */}
                        <Route
                            path="/box-types/"
                            render={() => <BoxTypesPage />}
                            exact={true}
                        />
                        <Route
                            path="/categories/"
                            render={() => <CategoriesPage />}
                            exact={true}
                        />
                        <Route
                            path="/search"
                            render={() => <SearchPage />}
                            exact={true}
                        />
                        <Route
                            path="/slices/typeBox/:id"
                            render={() => <BoxTypeSlicesPage />}
                            exact={true}
                        />
                        <Route
                            path="/slices/category/:id"
                            render={() => <CategorySlicesPage />}
                            exact={true}
                        />
                        <Route
                            path="/orders/:id"
                            render={() => <OrderDetailsPage />}
                            exact={true}
                        />
                        <Route
                            path="/orders/cancelled-order/:id"
                            render={() => <CancelledOrderPage />}
                            exact={true}
                        />
                        <Route
                            path="/orders/successful-order/:id"
                            render={() => <SuccessfulOrderPage />}
                            exact={true}
                        />
                        <Route
                            path="/guest-order-success/:id"
                            render={() => <GuestOrderSuccess />}
                            exact={true}
                        />
                        <Route
                            path="/guest-checkout"
                            render={() => <GuestCheckoutPage />}
                            exact={true}
                        />
                        <Route
                            path="/terms-and-conditions"
                            render={() => <TermsAndConditionsPage />}
                            exact={true}
                        />
                        <Route
                            path="/privacy-policy"
                            render={() => <PrivacyPolicyPage />}
                            exact={true}
                        />
                        <Route
                            path="/languages"
                            render={() => <LanguagesPage />}
                            exact={true}
                        />
                        <Route
                            path="/faqs"
                            render={() => <FAQPage />}
                            exact={true}
                        />
                        <Route
                            path="/faqs/profood-box-and-services"
                            render={() => <ProfoodBoxAndServices />}
                            exact={true}
                        />
                        <Route
                            path="/faqs/order-and-delivery"
                            render={() => <OrderAndDelivery />}
                            exact={true}
                        />
                        <Route
                            path="/faqs/account-and-login"
                            render={() => <AccountAndLogin />}
                            exact={true}
                        />
                        <Route
                            path="/faqs/payments-and-refunds"
                            render={() => <PaymentsAndRefunds />}
                            exact={true}
                        />
                        <Route
                            path="/faqs/quality-and-hygiene"
                            render={() => <QualityAndHygiene />}
                            exact={true}
                        />
                        <Route
                            path="/signin"
                            render={() => <SignInPage />}
                            exact={true}
                        />
                        <Route
                            path="/signup"
                            render={() => <SignUpPage />}
                            exact={true}
                        />
                        <Route
                            path="/password-reset"
                            render={() => <PasswordResetPage />}
                            exact={true}
                        />
                        <Route
                            path="/"
                            render={() => <Redirect to='/views/home' />}
                            exact={true}
                        />
                        {/* <Route
                            path="/error-404"
                            render={() => <NotFoundPage />}
                            exact={true}
                        /> */}
                        {/* <Route render={() => <NotFoundPage />} /> */}
                    </IonRouterOutlet>
                    {/* end::RouterOutlet */}
                </IonSplitPane>
                {/* end::SplitPane */}
                {/* begin::MobileBottomNav - Shows on pages outside /views/* */}
                <MobileBottomNav />
                {/* end::MobileBottomNav */}
            </IonReactRouter>
            {/* end::ReactRouter */}
            {/* <div id="recaptcha-container"></div> */}
        </IonApp>
    );
};

export default App;
