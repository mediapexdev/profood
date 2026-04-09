import React, { useCallback } from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import useGoTo from "../hooks/useGoTo";
import { formatNumber } from "../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../contexts/LoadingSpinnerProvider";
import PriceDisplay from "../price/PriceDisplay";

import '../promotions/PromoBadge.css';
import './BoxType.css';

/**
 *
 */
export interface BoxTypeProps {
    id: number;
    wording: string;
    price: number;
    capacity: number;
    illustration: string;
    // Promotional pricing fields from API
    promotional_price?: number | null;
    promotion_starts_at?: string | null;
    promotion_ends_at?: string | null;
    // Computed fields from API
    is_on_promotion?: boolean;
    effective_price?: number;
    discount_percentage?: number | null;
}

/**
 * 
 * @param boxType 
 * @returns 
 */
const BoxType: React.FC<BoxTypeProps> = (boxType: BoxTypeProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     * @param id 
     */
    const navigate = useCallback((id: number) => {
        setShowSpinner(true);
        setTimeout(() => {
            setShowSpinner(false);
        }, 1000);
		goTo(`/slices/typeBox/${id}`, 'none', 'push');
	}, []);

    return (
        <IonCard className="box-type-widget card translucent-style">
            <div className="box-type-image-wrapper">
                {/* Show discount badge for promotional price */}
                {boxType.is_on_promotion && boxType.discount_percentage && (
                    <div className="promo-badge promo-badge--small">
                        <span>-{boxType.discount_percentage}%</span>
                    </div>
                )}
                <img
                    className="box-type-image blur-shadow position-bottom"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + boxType.id + '.jpg')}
                    src={boxType.illustration}
                    alt={boxType.wording}
                />
                <img
                    className="box-type-image"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + boxType.id + '.jpg')}
                    src={boxType.illustration}
                    alt={boxType.wording}
                />
            </div>
            <IonCardContent className="box-type-widget-content card-body">
                <div className="box-type-infos">
                    <div className="box-type-title-wrapper">
                        <IonCardTitle className="box-type-title card-title title-color font-md">{boxType.wording}</IonCardTitle>
                    </div>
                    <div className="box-type-slices-number-wrapper">
                        <IonCardSubtitle className="box-type-slices-number content-color font-sm">{boxType.capacity} {t('découpes')}</IonCardSubtitle>
                    </div>
                    <div className='card-footer'>
                        <div className="box-type-price-wrapper font-sm">
                            <PriceDisplay
                                price={boxType.price}
                                promotionalPrice={boxType.promotional_price}
                                isOnPromotion={boxType.is_on_promotion}
                                discountPercentage={boxType.discount_percentage}
                                size="small"
                            />
                        </div>
                        <div className="box-type-widget-buttons-wrapper">
                            <IonButton
                                type='button'
                                buttonType='button'
                                fill='solid'
                                size='small'
                                color='primary'
                                className="box-type-widget-button"
                                onClick={() => navigate(boxType.id)}
                            >
                                <span className="btn-text">{t('Acheter')}</span>
                            </IonButton>
                        </div>
                    </div>
                </div>
            </IonCardContent>
		</IonCard>
    );
};

export default BoxType;
