import React from "react";

import { IonBadge, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle } from "@ionic/react";

import { CartSliceProps } from "../../../cart/components/slices/CartSlice";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../../helpers/AssetHelpers";

import './OrderSlice.css';

/**
 * 
 */
export interface OrderSliceProps extends CartSliceProps {
}

/**
 * 
 * @param slice_props 
 * @returns 
 */
const OrderSlice : React.FC<OrderSliceProps> = (slice_props : OrderSliceProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <IonCard className="slice-widget order-slice-widget card translucent-style">
            <div className="slice-image-wrapper">
                <img
                    className="slice-image img-fluid"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/slices/' + slice_props.slice.illustration)}
                    src={slice_props.slice.illustration}
                    alt={t(slice_props.slice.wording)}
                />
            </div>
            <IonCardContent className="slice-widget-content order-slice-widget-content card-body">
                <div className="slice-infos">
                    <div className="slice-title-wrapper">
                        <IonCardTitle className="slice-title card-title title-color font-md">{t(slice_props.slice.wording)}</IonCardTitle>
                    </div>
                    <div className="d-flex flex-stack mb-2">
                        {/* <div className="slice-weight-wrapper">
                            <IonCardSubtitle className="slice-weight content-color font-sm">
                                <span>{formatNumber(cart_slice_props.slice.weight)}</span>
                                <span>kg</span>
                            </IonCardSubtitle>
                        </div> */}
                        <div className="slice-price-wrapper">
                            <IonCardSubtitle className="slice-price title-color font-sm">
                                <span>{formatNumber(slice_props.slice.price)}</span>
                                <small className="ms-1">Fcfa</small>
                            </IonCardSubtitle>
                        </div>
                        <IonBadge className="selected-products-number">
                            <span style={{marginRight: '1px'}}>x</span>
                            <span>
                                {slice_props.quantity}
                            </span>
                        </IonBadge>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default OrderSlice;
