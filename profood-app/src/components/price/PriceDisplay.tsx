import React from 'react';
import { formatNumber } from '../../helpers/AssetHelpers';
import './PriceDisplay.css';

/**
 * Props for the PriceDisplay component
 */
export interface PriceDisplayProps {
    /** Regular price of the product */
    price: number;
    /** Promotional price (if promotion is active) */
    promotionalPrice?: number | null;
    /** Whether the product is currently on promotion */
    isOnPromotion?: boolean;
    /** Calculated discount percentage */
    discountPercentage?: number | null;
    /** Size variant for different contexts */
    size?: 'small' | 'default' | 'large';
    /** Show currency label */
    showCurrency?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * PriceDisplay component that shows promotional pricing with strikethrough
 * for original price when a product is on promotion.
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    promotionalPrice,
    isOnPromotion = false,
    discountPercentage,
    size = 'default',
    showCurrency = true,
    className = ''
}) => {
    // Determine the effective price to display
    const effectivePrice = isOnPromotion && promotionalPrice ? promotionalPrice : price;
    const hasPromotion = isOnPromotion && promotionalPrice && promotionalPrice < price;

    return (
        <div className={`price-display price-display--${size} ${hasPromotion ? 'price-display--promo' : ''} ${className}`}>
            {hasPromotion ? (
                <>
                    <div className="price-display__promo-row">
                        <span className="price-display__promotional">
                            {formatNumber(effectivePrice)}
                        </span>
                        {showCurrency && (
                            <small className="price-display__currency">Fcfa</small>
                        )}
                        {discountPercentage && (
                            <span className="price-display__badge">
                                -{discountPercentage}%
                            </span>
                        )}
                    </div>
                    <div className="price-display__original-row">
                        <span className="price-display__original">
                            {formatNumber(price)}
                        </span>
                        {showCurrency && (
                            <small className="price-display__currency--muted">Fcfa</small>
                        )}
                    </div>
                </>
            ) : (
                <div className="price-display__normal-row">
                    <span className="price-display__price">
                        {formatNumber(price)}
                    </span>
                    {showCurrency && (
                        <small className="price-display__currency">Fcfa</small>
                    )}
                </div>
            )}
        </div>
    );
};

export default PriceDisplay;
