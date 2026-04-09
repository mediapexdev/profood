import React from 'react';
import { IonBadge } from '@ionic/react';
import { ProductPromotion } from '../../types/Promotion';

import './PromoBadge.css';

/**
 * Props for the PromoBadge component
 */
interface PromoBadgeProps {
    /**
     * The promotion to display
     */
    promotion: ProductPromotion;

    /**
     * Size variant: 'small' for compact display, 'default' for full display
     */
    size?: 'small' | 'default';
}

/**
 * Badge component to display a promotion on a product card.
 * Shows the discount description in a colored badge.
 */
const PromoBadge: React.FC<PromoBadgeProps> = ({ promotion, size = 'default' }) => {
    const getDiscountText = () => {
        switch (promotion.discount_type) {
            case 'percentage':
                return `-${promotion.discount_value}%`;
            case 'fixed_amount':
                return size === 'small'
                    ? `-${promotion.discount_value}F`
                    : `-${promotion.discount_value} Fcfa`;
            case 'free_delivery':
                return size === 'small' ? 'Livr. Gratuite' : 'Livraison Gratuite';
            default:
                return 'Promo';
        }
    };

    return (
        <IonBadge
            className={`promo-badge promo-badge--${size} promo-badge--${promotion.discount_type}`}
            color="danger"
        >
            {getDiscountText()}
        </IonBadge>
    );
};

export default PromoBadge;
