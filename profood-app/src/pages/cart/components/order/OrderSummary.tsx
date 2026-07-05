import React, { useEffect, useState } from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid,
    IonRow,
    useIonModal,
    useIonRouter
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import LocalityModal from "../modals/LocalityModal";
import EmptyCart from "../others/EmptyCart";
import { SHA256_Encrypt, formatDate, formatNumber } from "../../../../helpers/AssetHelpers";
import { captureDeliveryCoordinates } from "../../../../helpers/Geolocation";
import OrderFinalizationModal from "../modals/OrderFinalizationModal";
import { useLoadingSpinnerContext } from "../../../../contexts/LoadingSpinnerProvider";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";
import { useCartContext } from "../contexts/CartProvider";
import { useOrdersContext } from "../../../orders/components/contexts/OrdersProvider";
import useGoToOrders from "../../../../components/hooks/useGoToOrders";
import { useDataContext } from "../../../../contexts/DataProvider";
import PromoCodeInput from "../../../../components/promotions/PromoCodeInput";
import { PromoValidationResult } from "../../../../types/Promotion";

import './OrderSummary.css';

/**
 * 
 * @returns 
 */
const OrderSummary: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { totalBoxes, totalSlices } = useCartContext();

    /**
     *
     */
    const { id, logged } = useUserInfosContext();

    /**
     * Ionic router used to navigate guests to the guest checkout page.
     */
    const router = useIonRouter();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const { updateBoxes, updateSlices } = useCartContext();

    /**
     * 
     */
    const { fetchOrders } = useOrdersContext();

    /**
     * 
     */
    const goToOrders = useGoToOrders();

    /**
     * Applied promo, restored from local storage so it survives navigation to
     * the locality / order-finalization modals. The discount is cosmetic on the
     * client — the server re-validates the code and recomputes the discount from
     * real prices on order creation (the client montant is ignored server-side).
     */
    type AppliedPromo = NonNullable<PromoValidationResult['promotion']>;
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(() => {
        const stored = localStorage.getItem('appliedPromoCode');
        return stored ? JSON.parse(stored) : null;
    });
    const discount = appliedPromo
        ? (appliedPromo.discount_amount ?? appliedPromo.calculated_discount ?? 0)
        : 0;
    const grandTotal = Math.max(0, totalBoxes + totalSlices - discount);

    /**
     *
     */
    const addOrder = async () => {
        setShowSpinner(true);
        const orderStringId = SHA256_Encrypt(formatDate(new Date(), 'full', true, 'full'));
        const address = localStorage.getItem('selectedLocality');
        const localiteId = localStorage.getItem('selectedLocaliteId');
        localStorage.removeItem('selectedLocality');
        localStorage.removeItem('selectedLocaliteId');
        const coords = await captureDeliveryCoordinates();
        const data: any = {
            // command_id: 1,
            customer_id: id,
            address: address,
            montant: grandTotal,
            order_id: orderStringId,
            ...(coords ?? {}),
        };
        // The server resolves the delivery zone fee from this id; montant is
        // recomputed server-side, so the client total is only cosmetic.
        if (localiteId) {
            data.localite_id = Number(localiteId);
        }
        if (appliedPromo) {
            // Server re-validates the code and recomputes the discount from real
            // prices; this client montant is ignored server-side.
            data.promotion_code = appliedPromo.code;
        }
        const token = localStorage.getItem('token');

        api.post('/add-order-without-payment', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                setShowSpinner(false);
                showToast(t(res.data.message));
                updateBoxes([]);
                updateSlices([]);
                localStorage.removeItem('appliedPromoCode');
                setAppliedPromo(null);
                fetchOrders();
                goToOrders();
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.dir(error);
        });
    };

    /**
     * 
     */
    const proceedToPayment = async () => {

        const token = localStorage.getItem('token');
        const orderStringId = SHA256_Encrypt(formatDate(new Date(), 'full', true, 'full'));
        const address = localStorage.getItem('selectedLocality');
        const localiteId = localStorage.getItem('selectedLocaliteId');
        // localStorage.removeItem('selectedLocality');
        const coords = await captureDeliveryCoordinates();
        const requestTokenUrl = process.env.NODE_ENV === "production" ?
            // 'https://api-profood.herokuapp.com/api/send-payment' :
            'https://api.profood-app.com/api/add-order-with-payment' :
            'http://localhost:8000/api/add-order-with-payment';

        const paymentPayload: any = {
            // command_id: 1,
            customer_id: id,
            address: address,
            montant: grandTotal,
            order_id: orderStringId,
            ...(coords ?? {}),
            //will be sent to paiement.php page
        };
        // Delivery zone fee resolved server-side from this id; PayTech is issued
        // for the server-computed montant, so the client total is only cosmetic.
        if (localiteId) {
            paymentPayload.localite_id = Number(localiteId);
        }
        if (appliedPromo) {
            // Server re-validates and recomputes the discount authoritatively.
            // An invalid code makes add-order-with-payment return 422 BEFORE any
            // PayTech token is issued, so payment is blocked on a bad code.
            paymentPayload.promotion_code = appliedPromo.code;
        }

        new window.PayTech(paymentPayload)
        .withOption({
            requestTokenUrl: requestTokenUrl,
            method: "POST",
            headers: {
                Accept: "text/html",
                Authorization: `Bearer ${token}`
            },
            // prensentationMode: window.PayTech.OPEN_IN_POPUP,
            prensentationMode: window.PayTech.OPEN_IN_SAME_TAB,
            willGetToken: function () {
                // showToast(t('Veuillez patienter...'), 2000);
                setShowSpinner(true);
            },
            didGetToken: function (pt_token: string, redirectUrl: string) {
                localStorage.removeItem('selectedLocality');
                localStorage.removeItem('selectedLocaliteId');
                // The order (with its promo usage) is already persisted once the
                // token is issued, so drop the applied code from local storage.
                localStorage.removeItem('appliedPromoCode');
                // localStorage.setItem('pt_token', pt_token);
                localStorage.setItem('order_id', orderStringId);
                console.log(pt_token + " " + redirectUrl);
                console.log('test success');
                // modal.current?.dismiss();
                setTimeout(() => setShowSpinner(false), 6000);
            },
            didReceiveError: function (error: any) {
                setShowSpinner(false);
                showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`, 2000);
                console.log(error);
                console.log('test error');
            },
            didReceiveNonSuccessResponse: function (jsonResponse: any) {
                setShowSpinner(false);
                showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`, 2000);
                console.log('test failure');
                console.log(jsonResponse)
            },
        })
        .send();
    };

    /**
     * 
     */
//    const [localitiesInfo, setLocalitiesInfo] = useState<LocalityInfo[]>([]);
   const { localities: localitiesInfo } = useDataContext();
   const [isEmpty, setIsEmpty] = useState<boolean>(true);

    /**
     * 
     */
    // useEffect(() => {
	// 	api.get("/get-localites-with-full-info")
    //     .then((res) => {
    //         setLocalitiesInfo(res.data);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
	// }, []);

    /**
     * 
     */
    useEffect(() => {
        setIsEmpty((totalBoxes + totalSlices) <= 0);
	}, [totalBoxes, totalSlices]);

    /**
     * 
     */
    const [presentLocalityModal, dismissLocalityModal] = useIonModal(LocalityModal, {
        localitiesInfo: localitiesInfo,
        onDismiss: (role?: 'cancel' | 'confirm', locality?: string, localityId?: number) =>
            dismissLocalityModal({ wording: locality, id: localityId }, role)
    });

    /**
     * 
     */
    const [presentOrderFinalizationModal, dismissOrderFinalizationModal] = useIonModal(OrderFinalizationModal, {
        onDismiss: (role?: 'cancel' | 'confirm', selection?: 16 | 32) => dismissOrderFinalizationModal(selection, role)
    });

    /**
     * 
     */
    const openOrderFinalizationModal = () => {

        presentOrderFinalizationModal({
            // cssClass: 'form-modal',
            id: 'orderFinalizationModal',
            backdropDismiss: false,
            onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                if(ev.detail.role === 'cancel') {
                    localStorage.removeItem('selectedLocality')
                }
                else if(ev.detail.role === 'confirm') {
                    switch (ev.detail.data) {
                        case 16:
                            proceedToPayment();
                            break;
                        case 32:
                            // setTimeout(() => openCustomerPhoneNumberEditModal(), 240);
                            addOrder();
                            break;
                        default:
                            break;
                    }
                }
            }
        });
    };

    /**
     * Opens the locality selection modal (authenticated flow only).
     */
    const openLocalityModal = () => {

        presentLocalityModal({
            cssClass: 'form-modal',
            id: 'localityModal',
            backdropDismiss: false,
            // onDidDismiss: () => resetChanges()
            onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                if (ev.detail.role === 'confirm') {
                    // setTimeout(() => openOrderFinalizationModal(), 200);
                    localStorage.setItem('selectedLocality', ev.detail.data?.wording ?? '');
                    // Persist the locality id so the order resolves its delivery zone.
                    if (ev.detail.data?.id != null) {
                        localStorage.setItem('selectedLocaliteId', String(ev.detail.data.id));
                    } else {
                        localStorage.removeItem('selectedLocaliteId');
                    }
                    openOrderFinalizationModal();
                    // addOrder();
                }
            }
        });
    };

    /**
     * Entry point for the checkout button.
     *
     * Logged-in users follow the existing locality → order-finalization modal
     * flow.  Unauthenticated users are routed to the dedicated guest checkout
     * page so they can place an order without creating an account.
     */
    const handleCheckout = () => {
        if (logged) {
            openLocalityModal();
        } else {
            router.push('/guest-checkout', 'forward', 'push');
        }
    };

    if(isEmpty){
        return (
            <EmptyCart
                text={`${t('Votre panier est vide pour le moment')}.`}
                redirectedUrl=''
            />
        );
    }
    return (
        <IonCard className="order-summary-widget card translucent-style">
            {/* <div className="slice-image-wrapper">
                <img
                    className="slice-image img-fluid"
                    src={toAbsolutePublicUrl('/media/images/illustrations/slices/' + cart_slice_props.slice.illustration)}
                    alt={cart_slice_props.slice.wording}
                />
            </div> */}
            <IonCardHeader className="order-summary-widget-header">
                <IonCardTitle className="order-summary-widget-title card-title title-color font-lg">{t("Récapitulatif de la commande")}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="order-summary-content order-summary-widget-content card-body">
                <IonGrid className="m-0 p-0">
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
                            <span>{formatNumber(totalBoxes)}</span>
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
                            <span>{formatNumber(totalSlices)}</span>
                            <small className="ms-1">Fcfa</small>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-promo-code">
                        <IonCol size="12" className="px-0">
                            <PromoCodeInput
                                subtotal={totalBoxes + totalSlices}
                                applied={appliedPromo}
                                onApplied={setAppliedPromo}
                                onRemoved={() => setAppliedPromo(null)}
                            />
                        </IonCol>
                    </IonRow>
                    {appliedPromo && (
                        <IonRow className="row-discount content-color font-sm">
                            <IonCol size="6" className="col-wording ps-0">
                                <span>{t('Réduction')} ({appliedPromo.code})</span>
                            </IonCol>
                            <IonCol size="6" className="col-amount pe-0">
                                <span>- {formatNumber(discount)}</span>
                                <small className="ms-1">Fcfa</small>
                            </IonCol>
                        </IonRow>
                    )}
                    <IonRow className="row-total-amount title-color font-md">
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
                            <span>{formatNumber(grandTotal)}</span>
                            <small className="ms-1">Fcfa</small>
                        </IonCol>
                    </IonRow>
                    <IonRow className="row-btn-checkout mt-5">
                        <IonCol
                            size="12"
                            className="col-btn-checkout px-0"
                        >
                            <IonButton
                                type='button'
                                buttonType='button'
                                expand="block"
                                fill='solid'
                                size='default'
                                color='primary'
                                // id="showLocalityModal"
                                className="cart-checkout-button mx-0"
                                disabled={isEmpty}
                                // disabled={isEmpty || selectedLocalityInfo === undefined || selectedLocalityInfo === null || !selectedLocalityInfo.wording.length}
                                onClick={handleCheckout}
                            >
                                <span className='btn-text font-md'>{t('Commander')}</span>
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
            {/* <LocalityModal localitiesInfo={localitiesInfo} onDismiss={ond} /> */}
        </IonCard>
    );
};

export default OrderSummary;
