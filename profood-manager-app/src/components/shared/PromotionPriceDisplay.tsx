import React from 'react';
import { formatNumber } from '../../helpers/AssetHelpers';

interface PromotionPriceDisplayProps {
    /** The regular, non-discounted price. Always required. */
    price: number;
    /** The discounted price. Only rendered when isOnPromotion is true and the
     *  value is strictly lower than price. */
    promotionalPrice?: number | null;
    /** When false (or omitted) the component renders the regular price only,
     *  even if promotionalPrice is provided. This lets callers control display
     *  based on the server-side flag without duplicating the guard logic. */
    isOnPromotion?: boolean;
    /**
     * Pre-computed discount percentage from the API response.
     * When omitted the component derives it locally from price and
     * promotionalPrice so callers that do not have the value can still render
     * the badge correctly.
     */
    discountPercentage?: number | null;
}

/**
 * PromotionPriceDisplay
 *
 * Renders a product price with optional promotional styling:
 *   - Regular state : "125 000 Fcfa"
 *   - Promotion state: "~~125 000~~ 99 000 Fcfa  -21%"
 *
 * The component is intentionally display-only; all state lives in the parent.
 * Using `formatNumber` from AssetHelpers ensures the locale-aware thousands
 * separator (e.g. "125 000" in fr-SN vs "125,000" in en-US) is applied
 * consistently across the app.
 *
 * The discount badge is suppressed when the computed percentage rounds to zero
 * so that near-equal prices (e.g. 100 vs 99) never show a misleading "0%" label.
 */
const PromotionPriceDisplay: React.FC<PromotionPriceDisplayProps> = ({
    price,
    promotionalPrice,
    isOnPromotion,
    discountPercentage
}) => {
    const showPromotion =
        isOnPromotion &&
        promotionalPrice != null &&
        promotionalPrice < price;

    if (showPromotion) {
        // Prefer the server-supplied percentage when available; fall back to
        // local calculation. We guard against a non-positive result so the
        // badge is never rendered with "0%" or a negative value.
        const pct =
            discountPercentage != null
                ? discountPercentage
                : Math.round(((price - promotionalPrice!) / price) * 100);

        return (
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Struck-through original price */}
                <span>
                    <s className="text-muted fs-9">{formatNumber(price)}</s>
                </span>

                {/* Active promotional price */}
                <span className="fw-semibold">{formatNumber(promotionalPrice!)}</span>

                <small className="ms-0">Fcfa</small>

                {/* Discount badge — hidden when percentage rounds to zero */}
                {pct > 0 && (
                    <span className="badge bg-light-success text-success fw-medium fs-9">
                        -{pct}%
                    </span>
                )}
            </div>
        );
    }

    // Default: plain price display, consistent with existing price rendering
    // patterns found throughout the manager app.
    return (
        <span>
            <span>{formatNumber(price)}</span>
            <small className="ms-1">Fcfa</small>
        </span>
    );
};

export default PromotionPriceDisplay;
