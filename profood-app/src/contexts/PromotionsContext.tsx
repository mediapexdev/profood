import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api/api';
import { ActivePromotionsResponse, ProductPromotion, ProductPromotionsResponse } from '../types/Promotion';

/**
 * State interface for the promotions context
 */
interface PromotionsState {
    /**
     * All active promotions
     */
    activePromotions: ActivePromotionsResponse['promotions'];

    /**
     * Promotions mapped to specific products
     */
    productPromotions: ProductPromotionsResponse | null;

    /**
     * Loading state
     */
    isLoading: boolean;

    /**
     * Error message if fetch failed
     */
    error: string | null;
}

/**
 * Context value interface
 */
interface PromotionsContextValue extends PromotionsState {
    /**
     * Fetch active promotions from the API
     */
    fetchActivePromotions: () => Promise<void>;

    /**
     * Fetch promotions for specific products
     */
    fetchPromotionsForProducts: (
        boxTypeIds: number[],
        categoryIds: number[],
        sliceIds: number[]
    ) => Promise<void>;

    /**
     * Get the best promotion for a slice
     */
    getPromotionForSlice: (sliceId: number, categoryId?: number) => ProductPromotion | null;

    /**
     * Get the best promotion for a box type
     */
    getPromotionForBoxType: (boxTypeId: number) => ProductPromotion | null;

    /**
     * Get the best promotion for a category
     */
    getPromotionForCategory: (categoryId: number) => ProductPromotion | null;

    /**
     * Check if any order-level promotions are available
     */
    hasOrderLevelPromotions: () => boolean;

    /**
     * Get all order-level promotions
     */
    getOrderLevelPromotions: () => ProductPromotion[];
}

/**
 * Create the context with default values
 */
const PromotionsContext = createContext<PromotionsContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface PromotionsProviderProps {
    children: ReactNode;
}

/**
 * PromotionsProvider component that manages promotion state
 */
export const PromotionsProvider: React.FC<PromotionsProviderProps> = ({ children }) => {
    const [state, setState] = useState<PromotionsState>({
        activePromotions: [],
        productPromotions: null,
        isLoading: false,
        error: null,
    });

    /**
     * Fetch all active promotions
     */
    const fetchActivePromotions = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.get<ActivePromotionsResponse>('/active-promotions');
            setState(prev => ({
                ...prev,
                activePromotions: response.data.promotions || [],
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching active promotions:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Erreur lors du chargement des promotions',
            }));
        }
    }, []);

    /**
     * Fetch promotions for specific products
     */
    const fetchPromotionsForProducts = useCallback(
        async (boxTypeIds: number[], categoryIds: number[], sliceIds: number[]) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                const response = await api.post<ProductPromotionsResponse>('/promotions-for-products', {
                    box_type_ids: boxTypeIds,
                    category_ids: categoryIds,
                    slice_ids: sliceIds,
                });
                setState(prev => ({
                    ...prev,
                    productPromotions: response.data,
                    isLoading: false,
                }));
            } catch (error) {
                console.error('Error fetching product promotions:', error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Erreur lors du chargement des promotions produits',
                }));
            }
        },
        []
    );

    /**
     * Get the best promotion for a slice (highest discount value)
     */
    const getPromotionForSlice = useCallback(
        (sliceId: number, categoryId?: number): ProductPromotion | null => {
            if (!state.productPromotions) return null;

            const promotions: ProductPromotion[] = [];

            // Check direct slice promotions
            const slicePromos = state.productPromotions.slices[sliceId];
            if (slicePromos && slicePromos.length > 0) {
                promotions.push(...slicePromos);
            }

            // Check category promotions if slice doesn't have direct promo
            if (categoryId) {
                const categoryPromos = state.productPromotions.categories[categoryId];
                if (categoryPromos && categoryPromos.length > 0) {
                    promotions.push(...categoryPromos);
                }
            }

            // Return the best promotion (highest discount value for percentage, otherwise first)
            if (promotions.length === 0) return null;

            return promotions.reduce((best, current) => {
                if (current.discount_type === 'percentage' && best.discount_type === 'percentage') {
                    return current.discount_value > best.discount_value ? current : best;
                }
                if (current.discount_type === 'fixed_amount' && best.discount_type === 'fixed_amount') {
                    return current.discount_value > best.discount_value ? current : best;
                }
                // Prefer percentage discounts over fixed amounts
                if (current.discount_type === 'percentage') return current;
                return best;
            });
        },
        [state.productPromotions]
    );

    /**
     * Get the best promotion for a box type
     */
    const getPromotionForBoxType = useCallback(
        (boxTypeId: number): ProductPromotion | null => {
            if (!state.productPromotions) return null;

            const promotions = state.productPromotions.box_types[boxTypeId];
            if (!promotions || promotions.length === 0) return null;

            // Return the best promotion
            return promotions.reduce((best, current) => {
                if (current.discount_type === 'percentage' && best.discount_type === 'percentage') {
                    return current.discount_value > best.discount_value ? current : best;
                }
                return best;
            });
        },
        [state.productPromotions]
    );

    /**
     * Get the best promotion for a category
     */
    const getPromotionForCategory = useCallback(
        (categoryId: number): ProductPromotion | null => {
            if (!state.productPromotions) return null;

            const promotions = state.productPromotions.categories[categoryId];
            if (!promotions || promotions.length === 0) return null;

            return promotions[0]; // Return first promotion for category
        },
        [state.productPromotions]
    );

    /**
     * Check if any order-level promotions are available
     */
    const hasOrderLevelPromotions = useCallback(() => {
        if (!state.productPromotions) return false;
        return state.productPromotions.order_level.length > 0;
    }, [state.productPromotions]);

    /**
     * Get all order-level promotions
     */
    const getOrderLevelPromotions = useCallback(() => {
        if (!state.productPromotions) return [];
        return state.productPromotions.order_level;
    }, [state.productPromotions]);

    // Fetch active promotions on mount
    useEffect(() => {
        fetchActivePromotions();
    }, [fetchActivePromotions]);

    const value: PromotionsContextValue = {
        ...state,
        fetchActivePromotions,
        fetchPromotionsForProducts,
        getPromotionForSlice,
        getPromotionForBoxType,
        getPromotionForCategory,
        hasOrderLevelPromotions,
        getOrderLevelPromotions,
    };

    return (
        <PromotionsContext.Provider value={value}>
            {children}
        </PromotionsContext.Provider>
    );
};

/**
 * Hook to use the promotions context
 */
export const usePromotionsContext = (): PromotionsContextValue => {
    const context = useContext(PromotionsContext);
    if (context === undefined) {
        throw new Error('usePromotionsContext must be used within a PromotionsProvider');
    }
    return context;
};

export default PromotionsContext;
