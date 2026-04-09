import React, { useCallback, useContext } from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import { CategoryProps } from "../categories/Category";
import { formatNumber } from "../../helpers/AssetHelpers";
import SlicesHandlersContext from "../../contexts/SlicesHandlersContext";
import { useUIStateContext } from "../../contexts/UIStateProvider";
import { usePromotionsContext } from "../../contexts/PromotionsContext";
import MinusIcon from "../icons/svg/MinusIcon";
import PlusIcon from "../icons/svg/PlusIcon";
import PromoBadge from "../promotions/PromoBadge";
import PriceDisplay from "../price/PriceDisplay";

import './Slice.css';

/**
 *
 */
export interface SliceProps {
    id: number;
    category: CategoryProps;
    wording: string;
    price: number;
    weight: number;
    illustration: string;
    available_in_box: boolean;
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
 * @param slice_props 
 * @returns 
 */
const Slice: React.FC<SliceProps> = (slice_props : SliceProps) => {
    /**
     * 
     */
    // const [quantity,set]
    // const { addToCart, removeFromCart,getQuantity } = useBoxTypeContext();
    const { add, remove, getQuantity } = useContext(SlicesHandlersContext);

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * Adds a slice to the selection (works for both authenticated and guest users)
     */
    const handleAddToCart = useCallback(() => {
        const itemToAdd = { id: slice_props.id, quantity: 1 };
        add(itemToAdd);
    }, [add, slice_props.id]);

    /**
     * 
     */
    const handleRemove = useCallback(() => {
        remove(slice_props.id);
    }, [remove, slice_props.id]);

    /**
     *
     */
    const {showSlicePrice} = useUIStateContext();

    /**
     * Get promotions context to check for product-specific promos
     */
    const { getPromotionForSlice } = usePromotionsContext();

    /**
     * Check if this slice has an active promotion
     */
    const slicePromotion = getPromotionForSlice(slice_props.id, slice_props.category?.id);

    /**
     *
     */
    return (
        <IonCard className="slice-widget card translucent-style">
            <div className="slice-image-wrapper">
                {/* Show promo badge if slice has active promotion (promo code) */}
                {slicePromotion && (
                    <PromoBadge promotion={slicePromotion} size="small" />
                )}
                {/* Show discount badge for direct promotional price */}
                {slice_props.is_on_promotion && slice_props.discount_percentage && !slicePromotion && (
                    <div className="promo-badge promo-badge--small">
                        <span>-{slice_props.discount_percentage}%</span>
                    </div>
                )}
                <img
                    className="slice-image img-fluid"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/slices/' + slice_props.illustration)}
                    src={slice_props.illustration}
                    alt={t(slice_props.wording)}
                />
            </div>
            <IonCardContent className="slice-widget-content card-body">
                <div className="slice-infos">
                    <div className="slice-title-wrapper">
                        <IonCardTitle className="slice-title card-title title-color font-md">{t(slice_props.wording)}</IonCardTitle>
                    </div>
                    <div className="d-flex flex-stack mb-3">
                    {
                        (!showSlicePrice && <div className="slice-weight-wrapper">
                            <IonCardSubtitle className="slice-weight content-color font-sm">
                                <span>{formatNumber(slice_props.weight)}</span>
                                <span>kg</span>
                            </IonCardSubtitle>
                        </div>)
                    }
                    {
                        (showSlicePrice && <div className="slice-price-wrapper">
                            <IonCardSubtitle className="slice-price title-color font-sm">
                                <PriceDisplay
                                    price={slice_props.price}
                                    promotionalPrice={slice_props.promotional_price}
                                    isOnPromotion={slice_props.is_on_promotion}
                                    discountPercentage={slice_props.discount_percentage}
                                    size="small"
                                />
                            </IonCardSubtitle>
                        </div>)
                    }
                    </div>
                </div>
                <div className="slice-widget-buttons-wrapper">
                    <IonButton
                        type="button"
                        buttonType="button"
                        size="small"
                        fill="clear"
                        onClick={handleRemove}
                    >
                        <MinusIcon />
                    </IonButton>
                    <input
                        type="number"
                        // placeholder="0"
                        value={getQuantity(slice_props.id)}
                        min="0"
                        readOnly={true}
                    />
                    <IonButton
                        type="button"
                        buttonType="button"
                        size="small"
                        fill="clear"
                        onClick={handleAddToCart}
                    >
                        <PlusIcon />
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default Slice;
