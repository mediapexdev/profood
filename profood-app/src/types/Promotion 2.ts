/**
 * Structure for product-specific promotion targeting
 */
export interface ApplicableTo {
    /**
     * Type of targeting: 'all' for order-level, 'specific' for product-level
     */
    type: 'all' | 'specific';

    /**
     * Array of box type IDs this promotion applies to
     */
    box_type_ids?: number[];

    /**
     * Array of category IDs this promotion applies to
     */
    category_ids?: number[];

    /**
     * Array of slice IDs this promotion applies to
     */
    slice_ids?: number[];
}

/**
 * Represents a promotion that can be displayed on products
 */
export interface ProductPromotion {
    id: number;
    code: string;
    name: string;
    discount_type: 'percentage' | 'fixed_amount' | 'free_delivery';
    discount_value: number;
    discount_description: string;
    minimum_order_amount: number;
}

/**
 * Response from the active promotions endpoint
 */
export interface ActivePromotionsResponse {
    promotions: Array<{
        id: number;
        code: string;
        name: string;
        description?: string;
        discount_type: 'percentage' | 'fixed_amount' | 'free_delivery';
        discount_value: number;
        discount_description: string;
        minimum_order_amount: number;
        is_product_specific: boolean;
        applicable_to?: ApplicableTo;
        expires_at?: string;
    }>;
}

/**
 * Response from the promotions-for-products endpoint
 */
export interface ProductPromotionsResponse {
    box_types: { [key: number]: ProductPromotion[] };
    categories: { [key: number]: ProductPromotion[] };
    slices: { [key: number]: ProductPromotion[] };
    order_level: ProductPromotion[];
}

/**
 * Represents the result of validating a promo code against an order
 */
export interface PromoValidationResult {
    /**
     * Indicates whether the promo code is valid and applicable to the order
     */
    valid: boolean;

    /**
     * Details of the validated promotion, only present if valid is true
     */
    promotion?: {
        /**
         * The promo code that was validated (uppercase)
         */
        code: string;

        /**
         * Display name/description of the promotion
         */
        name: string;

        /**
         * Type of discount applied by this promotion
         * - percentage: Discount is a percentage of the order amount
         * - fixed_amount: Discount is a fixed amount in Fcfa
         * - free_delivery: Free delivery (delivery fee waived)
         */
        discount_type: 'percentage' | 'fixed_amount' | 'free_delivery';

        /**
         * The raw discount value
         * - For percentage: value between 0-100 (e.g., 15 for 15%)
         * - For fixed_amount: amount in Fcfa
         * - For free_delivery: typically 0 (delivery fee handled separately)
         */
        discount_value: number;

        /**
         * The actual discount amount calculated for this specific order in Fcfa
         * This is the amount that will be deducted from the order total
         */
        calculated_discount?: number;

        /**
         * Alternative field name used by the API
         */
        discount_amount?: number;
    };

    /**
     * Error message if validation failed (only present if valid is false)
     * Should be a translation key that can be passed to i18next
     */
    error?: string;
}
