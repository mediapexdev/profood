import React from 'react';
import { Route } from 'react-router-dom';

import {
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs
} from '@ionic/react';
import {
    bagOutline,
    bagSharp,
    cartOutline,
    cartSharp,
    homeOutline,
    homeSharp,
    personOutline,
    personSharp
} from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { AppPage } from './types';
import HomePage from '../../home/HomePage';
import CartPage from '../../cart/CartPage';
import OrdersPage from '../../orders/OrdersPage';
import AccountPage from '../../account/AccountPage';
// import NotFoundPage from '../../errors/NotFoundPage';

/**
 * 
 * @returns 
 */
const TabsMenu: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const appPages: AppPage[] = [
        {
            id: 'home',
            title: t('Accueil'),
            url: '/views/home',
            mdIcon: homeSharp,
            iosIcon: homeOutline,
            iconClassName: 'home'
        },
        {
            id: 'cart',
            title: t('Panier'),
            url: '/views/cart',
            mdIcon: cartSharp,
            iosIcon: cartOutline,
            iconClassName: 'cart'
        },
        {
            id: 'orders',
            title: t('Commandes'),
            url: '/views/orders',
            iosIcon: bagOutline,
            mdIcon: bagSharp,
            iconClassName: 'orders'
        },
        {
            id: 'account',
            title: t('Compte'),
            url: '/views/account',
            iosIcon: personOutline,
            mdIcon: personSharp,
            iconClassName: 'user-account'
        }
    ];
    return (
        <IonTabs>
            {/* begin::RouterOutlet */}
            <IonRouterOutlet>
                <Route
                    path='/views/home'
                    render={() => <HomePage />}
                    exact={true}
                />
                <Route
                    path='/views/cart'
                    render={() => <CartPage />}
                    exact={true}
                />
                <Route
                    path='/views/account'
                    render={() => <AccountPage />}
                    exact={true}
                />
                <Route
                    path='/views/orders'
                    render={() => <OrdersPage />}
                    exact={true}
                />
                {/* <Route render={() => <NotFoundPage />} /> */}
            </IonRouterOutlet>
            {/* end::RouterOutlet */}
            {/* begin::TabBar */}
            <IonTabBar
                id='mainTabBar'
                slot="bottom"
                translucent={true}
            >
            {
                appPages.map((appPage, index) => {
                    return (
                        <IonTabButton
                            key={index}
                            tab={appPage.id}
                            href={appPage.url}
                        >
                            <IonIcon
                                md={appPage.mdIcon}
                                ios={appPage.iosIcon}
                                className={appPage.iconClassName}
                            />
                            <IonLabel>{appPage.title}</IonLabel>
                        </IonTabButton>
                    );
                })
            }
            </IonTabBar>
            {/* end::TabBar */}
        </IonTabs>
    );
};

export default TabsMenu;
