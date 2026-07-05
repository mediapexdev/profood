import api from '../api/api';
import { PromoValidationResult } from '../types/Promotion';

/**
 * Validates a promo code against the backend API
 *
 * This function sends a promo code and order amount to the API for validation.
 * The backend checks:
 * - If the code exists and is active
 * - If the code hasn't expired
 * - If minimum order amount requirements are met
 * - If usage limits haven't been exceeded
 * - If the user hasn't already used this code (for single-use codes)
 *
 * @param code - The promo code to validate (will be converted to uppercase)
 * @param orderAmount - The subtotal amount of the order in Fcfa (before delivery)
 * @returns Promise resolving to validation result with discount details or error message
 *
 * @example
 * const result = await validatePromoCode('WELCOME10', 25000);
 * if (result.valid && result.promotion) {
 *   console.log(`Discount: ${result.promotion.calculated_discount} Fcfa`);
 * } else {
 *   console.log(`Error: ${result.error}`);
 * }
 */
export const validatePromoCode = async (
    code: string,
    orderAmount: number
): Promise<PromoValidationResult> => {
    try {
        // Send validation request to backend. Attach the auth token when the
        // customer is logged in so the backend evaluates first_order_only and
        // per-user usage limits against the real user. The shared api instance
        // has no request interceptor, so without this the validate call runs as
        // a guest (Auth::user()=null) and can disagree with the authoritative
        // re-check at order creation.
        const token = localStorage.getItem('token');
        const response = await api.post('/validate-promo-code', {
            code: code.toUpperCase(), // Normalize to uppercase
            order_amount: orderAmount
        }, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

        // Backend should return a PromoValidationResult structure
        return response.data;
    } catch (error: any) {
        // Handle API errors gracefully
        // Error messages from backend should be translation keys
        return {
            valid: false,
            error: error.response?.data?.error || 'Une erreur est survenue'
        };
    }
};
