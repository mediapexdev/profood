import React from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonCol,
    IonGrid,
    IonLabel,
    IonRow
} from "@ionic/react"

// import { OrderDetailModal } from "./OrderDetailModal";
import { BoxProps } from "../../../components/box/BoxDetails";
import { CartSliceProps } from "../../cart/components/slices/CartSlice";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "../../../helpers/AssetHelpers";
import useGoTo from "../../../components/hooks/useGoTo";
import { useLoadingSpinnerContext } from "../../../contexts/LoadingSpinnerProvider";

import "./Order.css"

/**
 * 
 */
export interface Cart {
    boxes_data: BoxProps[];
    slices_data: CartSliceProps[];
}

/**
 * 
 */
export interface OrderStatus {
    id: number;
    wording: string;
    code: number;
}

/**
 * 
 */
export interface OrderPaymentStatus {
    id: number;
    wording: string;
    code: number;
}

/**
 * 
 */
export interface OrderProps {
    id: number;
    string_id: string;
    cart: Cart;
    address: string;
    montant: number;
    status: OrderStatus;
    payment_status: OrderPaymentStatus;
    payment_method: string;
    created_at: string;
}

/**
 * 
 * @param order 
 * @returns 
 */
const Order: React.FC<OrderProps> = (order: OrderProps) => {
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
     * @returns 
     */
    const boxesAmount = (): string => {
        let amount: number = 0;

        order.cart.boxes_data.map((e) => {
            return amount += Number(e.type.price);
        })
        return formatNumber(amount);
    };

    /**
     * 
     * @returns 
     */
    const slicesAmount = (): string => {
        let amount: number = 0;

        order.cart.slices_data.map((e) => {
            return amount += Number(e.slice.price * e.quantity);
        })
        return formatNumber(amount);
    };

    /**
     * 
     */
    const items = [
        {
            name: 'Profood Box',
            quantity: order.cart.boxes_data.length,
            amount: boxesAmount()
        },
        {
            name: 'Au détail',
            quantity: order.cart.slices_data.length,
            amount: slicesAmount()
        }
    ];
    return(
        <IonCard className="order-widget card translucent-style">
            <IonCardHeader className="order-widget-header pb-2">
                <div className="d-flex flex-stack">
                    <div className="d-flex flex-column">
                        <IonCardTitle className="title-color font-md fw-semibold mb-1">ID: {order.string_id}</IonCardTitle>
                        <IonCardSubtitle className="fw-medium">{formatDate(new Date(order.created_at), 'long', true, 'short')}</IonCardSubtitle>
                    </div>
                    <div className="btn-see-details-wrapper">
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='solid'
                            size='small'
                            color='primary'
                            className='btn-see-details text-transform-none'
                            onClick={() => {
                                setShowSpinner(true);
                                setTimeout(() => setShowSpinner(false) , 400);
                                goTo(`/orders/${order.string_id}`, 'forward', 'push');
                            }}
                        >
                            <span>{t('Détails')}</span>
                        </IonButton>
                    </div>
                </div>
            </IonCardHeader>
            <IonCardContent className="order-widget-content card-body pb-2">
                <IonGrid class="px-0 pt-2">
                    {/* begin::Body */}
                    {
                        items.map((item, index) => {
                            return (
                                <IonRow
                                    className="px-0"
                                    key={index}
                                >
                                    <IonCol
                                        className="text-start px-0"
                                        size="4" size-sm="4" size-md='4' size-lg='4' size-xl='4'
                                    >
                                        <IonLabel className="font-sm fw-medium">{item.name}</IonLabel>
                                    </IonCol>
                                    <IonCol
                                        className="text-center px-0"
                                        size="4" size-sm="4" size-md='4' size-lg='4' size-xl='4'
                                    >
                                        <IonLabel className="font-sm fw-medium">{item.quantity}</IonLabel>
                                    </IonCol>
                                    <IonCol
                                        className="text-center px-0"
                                        size="4" size-sm="4" size-md='4' size-lg='4' size-xl='4'
                                    >
                                        <IonLabel className="order-boxes-amount font-sm fw-medium">
                                            <span>{item.amount}</span>
                                            <small className="ms-1">Fcfa</small>
                                        </IonLabel>
                                    </IonCol>
                                </IonRow>
                            );
                        })
                    }
                    {/* end::Body */}
                    {/* begin::Footer */}
                    <IonRow className="px-0 pt-2">
                        <IonCol
                            className="text-start px-0"
                            size="5" size-sm="5" size-md='5' size-lg='5' size-xl='5'
                        >
                            <IonLabel className="title-color font-md fw-semibold">Montant tolal</IonLabel>
                        </IonCol>
                        <IonCol
                            className="px-0"
                            size="3" size-sm="3" size-md='3' size-lg='3' size-xl='3'
                        >
                        </IonCol>
                        <IonCol
                            className="text-center px-0"
                            size="4" size-sm="4" size-md='4' size-lg='4' size-xl='4'
                        >
                            <IonLabel className="order-amount font-sm fw-semibold">
                                <span>{formatNumber(order.montant)}</span>
                                <small className="ms-1">Fcfa</small>
                            </IonLabel>
                        </IonCol>
                    </IonRow>
                    <IonRow className="px-0 pt-2">
                        <IonCol
                            className="text-end px-0"
                            size="12" size-sm="12" size-md='12' size-lg='12' size-xl='12'
                        >
                            <IonChip
                                className={`order-payment-status ${getPaymentStatusClassName(order.payment_status)} my-0`}
                                color={getColorByOrderPaymentStatus(order.payment_status)}
                            >
                                {t(order.payment_status.wording)}
                            </IonChip>
                        </IonCol>
                    </IonRow>
                    {/* end::Footer */}
                </IonGrid>
            {
                order.status.code === 64
                ?
                <div className="order-delivered-date-wrapper d-flex flex-center pt-2 pb-1 mt-2">
                    <IonLabel className="order-delivered-date">{`${t('Livrée le')} ${formatDate(new Date(order.created_at), 'full', true, 'short')}`}</IonLabel>
                </div>
                :
                <div className="order-status-wrapper d-flex flex-center pt-2 pb-1 mt-2">
                    <IonLabel className={`order-status ${order.status.wording.replaceAll(' ', '-').toLocaleLowerCase()}`}>{t(order.status.wording)}{order.status.code !== 80 ? '...' : ''}</IonLabel>
                </div>
            }
            </IonCardContent>
        </IonCard>
    );
};

export default Order;

/**
 * 
 * @param paymentStatus 
 * @returns 
 */
export function getPaymentStatusClassName(paymentStatus: OrderPaymentStatus): string {

    switch(paymentStatus.code){
        case 8:
            return 'paid';
        case 16:
            return 'unpaid';
        default:
            return '';
    }
}

/**
 * 
 * @param paymentStatus 
 * @returns 
 */
export function getColorByOrderPaymentStatus(paymentStatus: OrderPaymentStatus): string {

    switch(paymentStatus.code){
        case 8:
            return 'success';
        case 16:
            return 'danger';
        case 32:
            return 'warning';
        default:
            return '';
    }
}
