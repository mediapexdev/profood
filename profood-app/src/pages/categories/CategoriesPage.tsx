import React, { useState, useMemo, useCallback, createContext } from 'react';

import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonFooter,
    IonToolbar,
    RefresherEventDetail,
    useIonViewDidEnter
} from '@ionic/react';
import { reload } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import Header from './layout/Header';
import SliceList from '../../components/slices/SliceList';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import useGoToCart from '../../components/hooks/useGoToCart';
import useSliceCartHandlers from '../../components/hooks/useSliceCartHandlers';
import { useDataContext } from '../../contexts/DataProvider';
import CategoryProvider from '../../contexts/CategoryProvider';
import { CategoryProps } from '../../components/categories/Category';
import SlicesHandlersContext, { SlicesHandlersContextType } from '../../contexts/SlicesHandlersContext';
import CategoryNavigation from './layout/Navigation';

import './CategoriesPage.css';

/**
 * Context for selected category filter
 */
export interface SelectedCategoryContextType {
    selectedCategory: CategoryProps | undefined;
    changeSelectedCategory: (category?: CategoryProps) => void;
}

export const SelectedCategoryContext = createContext<SelectedCategoryContextType>({
    selectedCategory: undefined,
    changeSelectedCategory: () => {/* */}
});

/**
 * Inner component — must live under CategoryProvider so the quantity
 * steppers of LOGGED-IN users accumulate a selection submitted to the
 * server cart through the "Ajouter au panier" bar.  Guests bypass the
 * selection entirely: their taps go straight to the localStorage guest
 * cart, so they can order without an account.
 */
const CategoriesPageContent: React.FC = () => {
    const { t } = useTranslation();
    const toggleTabBar = useToggleTabBar();
    const goToCart = useGoToCart();

    /**
     * Selected category state
     */
    const [selectedCategory, setSelectedCategory] = useState<CategoryProps | undefined>(undefined);

    /**
     * Change selected category handler
     */
    const changeSelectedCategory = useCallback((category?: CategoryProps) => {
        setSelectedCategory(category);
    }, []);

    /**
     * Show tab bar on enter
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
    });

    /**
     * Get data from context
     */
    const { categoriesProps, slicesProps } = useDataContext();

    /**
     * Dual-mode cart handlers: guests write straight to the guest cart,
     * logged users build a selection submitted via the bar below.
     */
    const {
        logged,
        totalNumber,
        guestTotal,
        handleAdd,
        handleRemove,
        displayedQuantity,
        addToCart,
        resetSelection,
    } = useSliceCartHandlers(slicesProps);

    /**
     * Filter slices based on selected category
     */
    const filteredSlices = useMemo(() => {
        if (!selectedCategory || selectedCategory.id === 0) {
            return slicesProps;
        }
        return slicesProps.filter(slice => slice.category.id === selectedCategory.id);
    }, [selectedCategory, slicesProps]);

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            window.location.reload();
            event.detail.complete();
        }, 2000);
    };

    /**
     * Adapt the dual-mode handlers to the shape consumed by the Slice
     * steppers (SlicesHandlersContext).
     */
    const handlersContext = useMemo<SlicesHandlersContextType>(() => ({
        add: (item) => handleAdd(item.id),
        remove: handleRemove,
        getQuantity: displayedQuantity
    }), [displayedQuantity, handleAdd, handleRemove]);

    /** The footer grows when a bar is shown — content padding follows */
    const barVisible = logged ? totalNumber > 0 : guestTotal > 0;

    return (
        <SelectedCategoryContext.Provider value={{ selectedCategory, changeSelectedCategory }}>
            <SlicesHandlersContext.Provider value={handlersContext}>
                <IonPage id='categoriesPage' className={`categories-page${barVisible ? ' has-selection-bar' : ''}`}>
                    <Header />
                    <IonContent id='categoriesPageContent'>
                        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>

                        <div className="app-container">
                            <SliceList slicePropsList={filteredSlices} />
                        </div>
                    </IonContent>
                    <IonFooter
                        translucent={true}
                        id='categoriesPageFooter'
                        className='page-footer'
                    >
                        {/* Selection bar (logged users): submit the selection
                            to the server cart */}
                        {logged && totalNumber > 0 && (
                            <div className="cat-selection-bar" role="status">
                                <span className="cat-selection-count">
                                    {totalNumber} {t('découpes')}
                                </span>
                                <div className="cat-selection-actions">
                                    <IonButton
                                        type="button"
                                        buttonType="button"
                                        size="small"
                                        color="primary"
                                        className="cat-selection-add"
                                        onClick={addToCart}
                                    >
                                        {t('Ajouter au panier')}
                                    </IonButton>
                                    <IonButton
                                        type="button"
                                        buttonType="button"
                                        size="small"
                                        fill="clear"
                                        className="cat-selection-reset"
                                        onClick={resetSelection}
                                        aria-label={t('Réinitialiser la sélection')}
                                    >
                                        <IonIcon icon={reload} />
                                    </IonButton>
                                </div>
                            </div>
                        )}

                        {/* Cart shortcut (guests): items were added to the
                            guest cart immediately — offer a jump to the cart
                            to finish the order without an account */}
                        {!logged && guestTotal > 0 && (
                            <div className="cat-selection-bar" role="status">
                                <span className="cat-selection-count">
                                    {guestTotal} {t('découpes')}
                                </span>
                                <div className="cat-selection-actions">
                                    <IonButton
                                        type="button"
                                        buttonType="button"
                                        size="small"
                                        color="primary"
                                        className="cat-selection-add"
                                        onClick={() => goToCart()}
                                    >
                                        {t('Voir le panier')}
                                    </IonButton>
                                </div>
                            </div>
                        )}

                        <IonToolbar>
                            <CategoryNavigation categoryPropsList={categoriesProps} />
                        </IonToolbar>
                    </IonFooter>
                </IonPage>
            </SlicesHandlersContext.Provider>
        </SelectedCategoryContext.Provider>
    );
};

/**
 * CategoriesPage - Displays all products with category filter in footer.
 *
 * Logged-in users build a selection (CategoryProvider) submitted through
 * the "Ajouter au panier" bar — same API flow as the category pages.
 * Guests add straight to the localStorage guest cart and are offered a
 * shortcut to the cart, where the guest checkout flow takes over: no
 * account is required to place an order.
 */
const CategoriesPage: React.FC = () => (
    <CategoryProvider>
        <CategoriesPageContent />
    </CategoryProvider>
);

export default CategoriesPage;
