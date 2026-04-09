import React, { useMemo } from 'react';
import { IonRouterLink, IonBadge, IonIcon, IonSearchbar, IonButton } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useCartContext } from '../../pages/cart/components/contexts/CartProvider';
import { useThemeModeContext } from '../../contexts/ThemeModeProvider';
import { formatNumber } from '../../helpers/AssetHelpers';
import Logo from '../Logo';
import './DesktopNav.css';

/**
 * Desktop navigation header component
 * Displays horizontal navigation bar with logo, links, search, and cart on desktop screens (≥992px)
 *
 * Features:
 * - Brand logo with meat emoji on the left
 * - Main navigation links in the center
 * - Search bar for product discovery
 * - Shopping cart icon with item count badge
 * - Theme-aware styling (dark/light mode)
 * - Active link highlighting
 *
 * Navigation links:
 * - Accueil (Home) - /
 * - Nos Boxes (Our Boxes) - /box-types/
 * - Catégories (Categories) - /categories/
 * - Mon Compte (My Account) - /views/account
 *
 * @returns Desktop navigation component (hidden on mobile)
 */
const DesktopNav: React.FC = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const { themeMode } = useThemeModeContext();
    const { boxes, slices, totalBoxes, totalSlices } = useCartContext();

    /**
     * Calculate total number of items in cart (boxes + slices)
     * Memoized to prevent recalculation on every render
     */
    const cartItemCount = useMemo(() => {
        return boxes.length + slices.length;
    }, [boxes.length, slices.length]);

    /**
     * Calculate total cart amount
     */
    const cartTotal = useMemo(() => {
        return totalBoxes + totalSlices;
    }, [totalBoxes, totalSlices]);

    /**
     * Navigation links configuration
     * Each link includes path, translation key, and exact match requirement
     */
    const navLinks = [
        { path: '/', label: 'Accueil', exact: true },
        { path: '/box-types/', label: 'Nos Boxes', exact: false },
        { path: '/categories/', label: 'Catégories', exact: false },
        { path: '/views/account', label: 'Mon Compte', exact: false }
    ];

    /**
     * Check if a navigation link is currently active
     * Uses exact matching for home page, prefix matching for other routes
     *
     * @param path - The route path to check
     * @param exact - Whether to require exact path match
     * @returns true if the link should be highlighted as active
     */
    const isActiveLink = (path: string, exact: boolean): boolean => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    /**
     * Handle search bar click
     * Redirects to search page for product discovery
     */
    const handleSearchClick = () => {
        history.push('/search');
    };

    /**
     * Handle cart icon click
     * Navigates to shopping cart page
     */
    const handleCartClick = () => {
        history.push('/views/cart');
    };

    return (
        <header className={`desktop-nav ${themeMode === 'dark' ? 'desktop-nav--dark' : 'desktop-nav--light'}`}>
            <div className="desktop-nav__container">
                {/* Logo Section */}
                <div className="desktop-nav__logo">
                    <IonRouterLink routerLink="/" className="desktop-nav__logo-link">
                        <Logo />
                    </IonRouterLink>
                </div>

                {/* Main Navigation Links */}
                <nav className="desktop-nav__links">
                    {navLinks.map((link) => (
                        <IonRouterLink
                            key={link.path}
                            routerLink={link.path}
                            className={`desktop-nav__link ${
                                isActiveLink(link.path, link.exact) ? 'desktop-nav__link--active' : ''
                            }`}
                        >
                            {t(link.label)}
                        </IonRouterLink>
                    ))}
                </nav>

                {/* Search Bar */}
                <div className="desktop-nav__search" onClick={handleSearchClick}>
                    <IonSearchbar
                        placeholder={t('Rechercher un produit...')}
                        className="desktop-nav__searchbar"
                        disabled
                    />
                </div>

                {/* Cart Icon with Badge and Hover Dropdown */}
                <div className="desktop-nav__cart-wrapper">
                    <div className="desktop-nav__cart" onClick={handleCartClick}>
                        <div className="desktop-nav__cart-icon-wrapper">
                            <IonIcon icon={cartOutline} className="desktop-nav__cart-icon" />
                            {cartItemCount > 0 && (
                                <IonBadge className="desktop-nav__cart-badge" color="danger">
                                    {cartItemCount}
                                </IonBadge>
                            )}
                        </div>
                    </div>

                    {/* Cart Dropdown Preview */}
                    <div className={`desktop-nav__cart-dropdown ${themeMode === 'dark' ? 'desktop-nav__cart-dropdown--dark' : ''}`}>
                        {cartItemCount === 0 ? (
                            <div className="desktop-nav__cart-empty">
                                <IonIcon icon={cartOutline} className="desktop-nav__cart-empty-icon" />
                                <p>{t('Votre panier est vide pour le moment')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="desktop-nav__cart-items">
                                    {/* Boxes */}
                                    {boxes.slice(0, 3).map((box, index) => (
                                        <div key={`box-${index}`} className="desktop-nav__cart-item">
                                            <img
                                                src={box.type.illustration}
                                                alt={box.type.wording}
                                                className="desktop-nav__cart-item-img"
                                            />
                                            <div className="desktop-nav__cart-item-info">
                                                <span className="desktop-nav__cart-item-name">{box.type.wording}</span>
                                                <span className="desktop-nav__cart-item-price">{formatNumber(box.type.price)} Fcfa</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Slices */}
                                    {slices.slice(0, 3 - Math.min(boxes.length, 3)).map((cartSlice) => (
                                        <div key={`slice-${cartSlice.id}`} className="desktop-nav__cart-item">
                                            <img
                                                src={cartSlice.slice.illustration}
                                                alt={cartSlice.slice.wording}
                                                className="desktop-nav__cart-item-img"
                                            />
                                            <div className="desktop-nav__cart-item-info">
                                                <span className="desktop-nav__cart-item-name">{cartSlice.slice.wording}</span>
                                                <span className="desktop-nav__cart-item-qty">x{cartSlice.quantity}</span>
                                                <span className="desktop-nav__cart-item-price">{formatNumber(cartSlice.slice.price * cartSlice.quantity)} Fcfa</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* More items indicator */}
                                    {cartItemCount > 3 && (
                                        <div className="desktop-nav__cart-more">
                                            +{cartItemCount - 3} {t('autres produits')}
                                        </div>
                                    )}
                                </div>

                                <div className="desktop-nav__cart-footer">
                                    <div className="desktop-nav__cart-total">
                                        <span>{t('Total')}</span>
                                        <span className="desktop-nav__cart-total-amount">{formatNumber(cartTotal)} Fcfa</span>
                                    </div>
                                    <IonButton
                                        expand="block"
                                        color="danger"
                                        onClick={handleCartClick}
                                        className="desktop-nav__cart-btn"
                                    >
                                        {t('Voir le panier')}
                                    </IonButton>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DesktopNav;
