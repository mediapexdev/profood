import React from "react";

import {
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonChip,
    IonCol,
    IonGrid,
    IonRow
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import { OrderProps } from "./Order";
import NoOrderProduct from "./NoOrderProduct";
import { formatNumber } from "../../../helpers/AssetHelpers";

import './OrderPaymentDetails.css';

/**
 * 
 */
export interface OrderPaymentDetailsProp {
    order: OrderProps;
}

/**
 * 
 * @param prop 
 * @returns 
 */
const OrderPaymentDetails : React.FC<OrderPaymentDetailsProp> = (prop : OrderPaymentDetailsProp) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     * @returns 
     */
    const boxesAmount = () => {
        let amount : number = 0;

        if(prop.order !== undefined){
            prop.order.cart.boxes_data.map((e) => {
                return amount += Number(e.type.price);
            })
        }
        return formatNumber(amount);
    };

    /**
     * 
     * @returns 
     */
    const slicesAmount = () => {
        let amount : number = 0;

        if(prop.order !== undefined){
            prop.order.cart.slices_data.map((e) => {
                return amount += Number(e.slice.price * e.quantity);
            })
        }
        return formatNumber(amount);
    };

    /**
     * 
     */
    if(!prop.order.cart.boxes_data.length && !prop.order.cart.slices_data.length){
        return (
            <NoOrderProduct text={t("Aucun produit pour cette commande.")} />
        );
    }
    /**
     * 
     */
    return (
        <IonCard className="order-payment-details-widget card translucent-style">
            {/* <div className="slice-image-wrapper">
                <img
                    className="slice-image img-fluid"
                    src={toAbsolutePublicUrl('/media/images/illustrations/slices/' + cart_slice_props.slice.illustration)}
                    alt={cart_slice_props.slice.wording}
                />
            </div> */}
            {/* <IonCardHeader className="order-payment-details-widget-header">
                <IonCardTitle className="order-payment-details-widget-title card-title title-color font-lg">{t("Détails de paiement")}</IonCardTitle>
            </IonCardHeader> */}
            <IonCardContent className="order-payment-details-content order-payment-details-widget-content card-body">
                <IonGrid className="m-0 p-0">
                    <IonRow className="row-title title-color font-md">
                        <IonCol
                            size="12"
                            className="ps-0"
                        >
                            <IonCardTitle className="order-payment-details-title font-lg">{t("Détails de paiement")}</IonCardTitle>
                        </IonCol>
                    </IonRow>
                    <IonRow className="content-color font-sm">
                        <IonCol
                            size="6"
                            className="col-wording ps-0"
                        >
                            <span>{t("Total des boxes")}</span>
                        </IonCol>
                        <IonCol
                            size="6"
                            className="col-amount pe-0"
                        >
                            <span>{boxesAmount()}</span>
                            <small className="ms-1">Fcfa</small>
                        </IonCol>
                    </IonRow>
                    <IonRow className="content-color font-sm">
                        <IonCol
                            size="6"
                            className="col-wording ps-0"
                        >
                            <span>{t('Total des découpes')}</span>
                        </IonCol>
                        <IonCol
                            size="6"
                            className="col-amount pe-0"
                        >
                            <span>{slicesAmount()}</span>
                            <small className="ms-1">Fcfa</small>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-total-amount title-color font-md mb-3">
                        <IonCol
                            size="6"
                            className="col-wording ps-0"
                        >
                            <span>{t('Montant Total')}</span>
                        </IonCol>
                        <IonCol
                            size="6"
                            className="col-amount pe-0"
                        >
                            <span>{formatNumber(prop.order.montant)}</span>
                            <small className="ms-1">Fcfa</small>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-title title-color font-md">
                        <IonCol
                            size="12"
                            className="ps-0"
                        >
                            <IonCardTitle className="order-payment-details-title font-lg">{t("Adresse de livraison")}</IonCardTitle>
                        </IonCol>
                    </IonRow>
                    <IonRow className="content-color font-sm mb-3">
                        <IonCol
                            size="12"
                            className="col-wording ps-0"
                        >
                            <span>{prop.order.address}</span>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-title title-color font-md">
                        <IonCol
                            size="12"
                            className="ps-0"
                        >
                            <IonCardTitle className="order-payment-details-title font-lg">{t("Mode de paiement")}</IonCardTitle>
                        </IonCol>
                    </IonRow>
                    <IonRow className="content-color font-sm mb-3">
                        <IonCol
                            size="12"
                            className="col-wording ps-0"
                        >
                            <span>{t(!prop.order.payment_method ? 'Aucun' : prop.order.payment_method)}</span>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-payment-status">
                        <IonCol
                            size="12"
                            className="text-end px-0"
                        >
                        {
                            prop.order.payment_status.code === 8
                            ?
                            <IonChip
                                className="order-payment-status paid"
                                color='success'
                            >
                                {t('Payée')}
                            </IonChip>
                            :
                            <IonChip
                                className="order-payment-status unpaid"
                                color='danger'
                            >
                                {t('Non payée')}
                            </IonChip>
                        }
                        </IonCol>
                    </IonRow>
                    {/* <IonRow className="row-delivery-address mt-10">
                        <IonCol
                            size="12"
                            className="col-wording title-color"
                        >
                            <div className="d-flex flex-stack">
                                <div className="d-flex flex-center">
                                    <IonIcon
                                        icon={locationOutline}
                                        // size="large"
                                        className="me-1"
                                    />
                                    <IonTitle className="title-color font-md fw-semibold p-0">{t("Adresse de livraison")}</IonTitle>
                                </div>
                                <div className="btn-wrapper">
                                    <IonButton
                                        size="small"
                                        fill="solid"
                                        className="text-transform-none"
                                        color='dark'
                                        id="showLocalityModal"
                                    >
                                        <span>{t("Choisir")}</span>
                                    </IonButton>
                                </div>
                            </div>
                        </IonCol>
                        <IonCol
                            size="12"
                            className="col-delivery-address content-color"
                        >
                            <IonItem detail={false} lines="none">
                                <IonLabel>{(!selectedLocalityInfo) ? 'Aucune adresse pour le moment' : selectedLocalityInfo.wording}</IonLabel>
                            </IonItem>
                        </IonCol>
                    </IonRow> */}
                    {/* <IonRow className="row-btn-checkout mt-5">
                        <IonCol
                            size="12"
                            className="col-btn-checkout px-0"
                        >
                            <IonButton
                                buttonType='button'
                                expand="block"
                                fill='solid'
                                size='default'
                                color='primary'
                                id="showLocalityModal"
                                className="cart-checkout-button mx-0"
                                // disabled={isEmpty}
                                // disabled={isEmpty || selectedLocalityInfo === undefined || selectedLocalityInfo === null || !selectedLocalityInfo.wording.length}
                                // onClick={() => command()}
                            >
                                <span className='btn-text font-md'>{t('Commander')}</span>
                            </IonButton>
                        </IonCol>
                    </IonRow> */}
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};

export default OrderPaymentDetails;
