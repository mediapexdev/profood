import React from 'react';
import { createRoot } from 'react-dom/client';

import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

import LoadingSpinnerProvider from './contexts/LoadingSpinnerProvider';
import ThemeModeProvider from './contexts/ThemeModeProvider';
import DataProvider from './contexts/DataProvider';
import { PromotionsProvider } from './contexts/PromotionsContext';
import UserInfosProvider from './contexts/UserInfosProvider';
import CartProvider from './pages/cart/components/contexts/CartProvider';
import OrdersProvider from './pages/orders/components/contexts/OrdersProvider';
import App from './App';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

/**
 * 
 */
const container = document.getElementById('root');

/**
 * 
 */
const root = createRoot(container!);

/**
 * 
 */
root.render(
    <React.StrictMode>
        <LoadingSpinnerProvider>
            <I18nextProvider i18n={i18n}>
                <ThemeModeProvider>
                    <DataProvider>
                        <PromotionsProvider>
                            <UserInfosProvider>
                                <CartProvider>
                                    <OrdersProvider>
                                        <App />
                                    </OrdersProvider>
                                </CartProvider>
                            </UserInfosProvider>
                        </PromotionsProvider>
                    </DataProvider>
                </ThemeModeProvider>
            </I18nextProvider>
        </LoadingSpinnerProvider>
    </React.StrictMode>
);

// Enable Service Worker for PWA caching and offline capabilities
// This allows the app to load faster on subsequent visits and work offline
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
    onSuccess: (registration) => {
        console.log('Service Worker registered successfully. App is ready for offline use.');
    },
    onUpdate: (registration) => {
        console.log('New content is available. Please close all tabs to update.');
        // Optionally, you could show a toast notification to the user here
        // prompting them to reload the app for the latest version
    }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
