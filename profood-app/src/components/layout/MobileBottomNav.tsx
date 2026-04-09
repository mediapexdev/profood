import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { IonIcon, IonLabel } from '@ionic/react';
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

import './MobileBottomNav.css';

interface NavItem {
    id: string;
    title: string;
    url: string;
    mdIcon: string;
    iosIcon: string;
}

/**
 * MobileBottomNav - A persistent bottom navigation bar for mobile
 * This component is rendered outside the routing structure to ensure
 * it's always visible on all pages on mobile devices.
 */
const MobileBottomNav: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();

    const navItems: NavItem[] = [
        {
            id: 'home',
            title: t('Accueil'),
            url: '/views/home',
            mdIcon: homeSharp,
            iosIcon: homeOutline
        },
        {
            id: 'cart',
            title: t('Panier'),
            url: '/views/cart',
            mdIcon: cartSharp,
            iosIcon: cartOutline
        },
        {
            id: 'orders',
            title: t('Commandes'),
            url: '/views/orders',
            iosIcon: bagOutline,
            mdIcon: bagSharp
        },
        {
            id: 'account',
            title: t('Compte'),
            url: '/views/account',
            iosIcon: personOutline,
            mdIcon: personSharp
        }
    ];

    // Don't show on auth pages or certain utility pages
    const hiddenPaths = ['/signin', '/signup', '/password-reset'];
    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

    // Don't show if we're on /views/* routes (the native tab bar handles those)
    const isViewsRoute = location.pathname.startsWith('/views');

    if (shouldHide || isViewsRoute) {
        return null;
    }

    const handleNavClick = (url: string) => {
        history.push(url);
    };

    const isActive = (url: string) => {
        return location.pathname === url;
    };

    return (
        <nav className="mobile-bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`mobile-bottom-nav-item ${isActive(item.url) ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.url)}
                >
                    <IonIcon
                        icon={item.mdIcon}
                        className="mobile-bottom-nav-icon"
                    />
                    <IonLabel className="mobile-bottom-nav-label">{item.title}</IonLabel>
                </button>
            ))}
        </nav>
    );
};

export default MobileBottomNav;
