import React, { useState, useMemo, useCallback, createContext } from 'react';

import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonFooter,
    IonToolbar,
    RefresherEventDetail,
    useIonViewDidEnter
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import Header from './layout/Header';
import SliceList from '../../components/slices/SliceList';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import { useDataContext } from '../../contexts/DataProvider';
import { CategoryProps } from '../../components/categories/Category';
import SlicesHandlersContext, { SlicesHandlersContextType } from '../../contexts/SlicesHandlersContext';
import { SliceType } from '../../contexts/SliceType';
import { addSliceToGuestCart, removeSliceFromGuestCart, getGuestCart } from '../../services/GuestCartService';
import { useCartContext } from '../cart/components/contexts/CartProvider';
import useToast from '../../components/hooks/useToast';
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
 * CategoriesPage - Displays all products with category filter in footer
 */
const CategoriesPage: React.FC = () => {
    const { t } = useTranslation();
    const toggleTabBar = useToggleTabBar();
    const showToast = useToast();
    const { fetchData } = useCartContext();

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
     * Local state to track quantities for display
     */
    const [quantities, setQuantities] = useState<Map<number, number>>(() => {
        const cart = getGuestCart();
        const map = new Map<number, number>();
        cart.slices.forEach(s => map.set(s.slice_id, s.quantity));
        return map;
    });

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
     * Add slice to cart handler
     */
    const add = useCallback((item: SliceType) => {
        const slice = slicesProps.find(s => s.id === item.id);
        if (slice) {
            addSliceToGuestCart(slice, 1);
            setQuantities(prev => {
                const newMap = new Map(prev);
                newMap.set(item.id, (prev.get(item.id) || 0) + 1);
                return newMap;
            });
            fetchData();
            showToast(`${t(slice.wording)} ${t('ajouté au panier')}`);
        }
    }, [slicesProps, fetchData, showToast, t]);

    /**
     * Remove slice from cart handler
     */
    const remove = useCallback((itemId: number) => {
        const currentQty = quantities.get(itemId) || 0;
        if (currentQty <= 1) {
            removeSliceFromGuestCart(itemId);
            setQuantities(prev => {
                const newMap = new Map(prev);
                newMap.delete(itemId);
                return newMap;
            });
        } else {
            const slice = slicesProps.find(s => s.id === itemId);
            if (slice) {
                const cart = getGuestCart();
                const existingSlice = cart.slices.find(s => s.slice_id === itemId);
                if (existingSlice) {
                    existingSlice.quantity -= 1;
                    localStorage.setItem('profood_guest_cart', JSON.stringify(cart));
                }
            }
            setQuantities(prev => {
                const newMap = new Map(prev);
                newMap.set(itemId, currentQty - 1);
                return newMap;
            });
        }
        fetchData();
    }, [quantities, slicesProps, fetchData]);

    /**
     * Get quantity of slice in cart
     */
    const getQuantity = useCallback((itemId: number) => {
        return quantities.get(itemId) || 0;
    }, [quantities]);

    /**
     * Context value for slice handlers
     */
    const handlersContext: SlicesHandlersContextType = {
        add,
        remove,
        getQuantity
    };

    return (
        <SelectedCategoryContext.Provider value={{ selectedCategory, changeSelectedCategory }}>
            <SlicesHandlersContext.Provider value={handlersContext}>
                <IonPage id='categoriesPage' className='categories-page'>
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
                        <IonToolbar>
                            <CategoryNavigation categoryPropsList={categoriesProps} />
                        </IonToolbar>
                    </IonFooter>
                </IonPage>
            </SlicesHandlersContext.Provider>
        </SelectedCategoryContext.Provider>
    );
};

export default CategoriesPage;
