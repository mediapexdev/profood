import React from "react";

import {
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import { SliceProps } from "../../slices/Slice";
import { formatNumber } from "../../../helpers/AssetHelpers";

import './BoxSlice.css';

/**
 * 
 */
export interface BoxSliceProps {
    id: number;
    box_id: number;
    quantity: number;
    slice: SliceProps;
}

/**
 * 
 * @param box_slice_props 
 * @returns 
 */
const BoxSlice : React.FC<BoxSliceProps> = (box_slice_props: BoxSliceProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <IonCard className="slice-widget box-slice-widget card translucent-style">
            <div className="slice-image-wrapper">
                <img
                    className="slice-image img-fluid"
                    src={box_slice_props.slice.illustration}
                    alt={t(box_slice_props.slice.wording)}
                />
            </div>
            <IonCardContent className="slice-widget-content box-slice-widget-content card-body">
                <div className="slice-infos">
                    <div className="slice-title-wrapper">
                        <IonCardTitle className="slice-title card-title title-color font-md">{t(box_slice_props.slice.wording)}</IonCardTitle>
                    </div>
                    <div className="d-flex flex-stack mb-2">
                        <div className="slice-weight-wrapper">
                            <IonCardSubtitle className="slice-weight content-color font-sm">
                                <span>{formatNumber(box_slice_props.slice.weight)}</span>
                                <span>kg</span>
                            </IonCardSubtitle>
                        </div>
                        <IonBadge className="selected-products-number">{box_slice_props.quantity}</IonBadge>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default BoxSlice;
