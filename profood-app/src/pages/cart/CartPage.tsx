import React from 'react';

import { IonContent, IonPage, useIonViewDidEnter } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import Header from './layout/Header';
import ContentBody from './ContentBody';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import { useCartContext } from './components/contexts/CartProvider';

import './CartPage.css';

/**
 * Cart page component - unified view of all cart items
 * Shows boxes, slices, and order summary in a single scrollable page
 */
const CartPage: React.FC = () => {
    const { t } = useTranslation();
    const { boxes, slices } = useCartContext();
    const toggleTabBar = useToggleTabBar();

    const totalItems = boxes.length + slices.length;

    /**
     * Show tab bar when entering cart page
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
    });

    return (
        <IonPage id="cartPage">
            <Header />
            <IonContent
                id='cartPageContent'
                className='ion-padding'
            >
                <div className="cart-page-container">
                    {/* Desktop title */}
                    <div className="cart-desktop-header">
                        <h1 className="cart-desktop-title">
                            {t('Panier')}
                            {totalItems > 0 && (
                                <span className="cart-item-count">({totalItems} {totalItems > 1 ? t('articles') : t('article')})</span>
                            )}
                        </h1>
                    </div>
                    <ContentBody />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CartPage;
