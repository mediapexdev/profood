import React from "react";

import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { BoxTypeProps } from "./BoxType";
import { BoxSliceProps } from "./slices/BoxSlice";
import { formatNumber } from "../../helpers/AssetHelpers";

import './BoxDetails.css'

/**
 * 
 */
export interface BoxProps {
    id: number;
    type: BoxTypeProps;
    cart_id: number;
    box_slices: BoxSliceProps[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxDetails: React.FC<BoxProps> = (box_props: BoxProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <IonCard className="order-box-type-details card">
            <div className="box-type-image-wrapper">
                <img
                    className="box-type-image"
                    src={box_props.type.illustration}
                    alt={box_props.type.wording}
                />
            </div>
            <IonCardContent className="order-box-type-details-content card-body">
                <div className="box-type-infos d-flex flex-column justify-content-center h-100">
                    <div className="box-type-title-wrapper d-flex align-items-center">
                        <IonCardTitle className="box-type-title card-title title-color font-md me-6">{box_props.type.wording}</IonCardTitle>
                    </div>
                    <div className="d-flex flex-row flex-wrap align-items-center justify-content-start">
                        <div className="box-type-slices-number-wrapper">
                            <IonCardSubtitle className="box-type-slices-number content-color font-sm">
                                <span>{`${box_props.type.capacity} ${t("découpes")}`}</span>
                            </IonCardSubtitle>
                        </div>
                        <div className="mx-2">-</div>
                        <div className="box-type-price-wrapper font-sm">
                            <IonCardSubtitle className="box-type-price">
                                <span>{formatNumber(box_props.type.price)}</span>
                                <small className='box-type-price-currency ms-1'>Fcfa</small>
                            </IonCardSubtitle>
                        </div>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
}

export default BoxDetails;
