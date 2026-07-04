import React, { useState } from 'react';

import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import api from '../../api/api';
import GuestCheckoutForm, { GuestInfo } from '../cart/components/forms/GuestCheckoutForm';
import { getGuestCart, clearGuestCart } from '../../services/GuestCartService';
import { PromoValidationResult } from '../../types/Promotion';
import { SHA256_Encrypt, formatDate, toAbsolutePublicUrl } from '../../helpers/AssetHelpers';
import { captureDeliveryCoordinates } from '../../helpers/Geolocation';
import { useLoadingSpinnerContext } from '../../contexts/LoadingSpinnerProvider';
import { useCartContext } from '../cart/components/contexts/CartProvider';
import useToast from '../../components/hooks/useToast';

import './GuestCheckoutPage.css';

/**
 * Payment method type
 */
type PaymentMethod = 'electronic' | 'cash';

/**
 * Guest checkout page component.
 * Handles the complete guest checkout flow:
 * 1. Collect guest information (name, phone, email, address)
 * 2. Select payment method (electronic or cash on delivery)
 * 3. Submit order
 *
 * @returns GuestCheckoutPage component
 */
const GuestCheckoutPage: React.FC = () => {
    /**
     * Translation hook for internationalization
     */
    const { t } = useTranslation();

    /**
     * Router hook for navigation - using window.location for PayTech redirect
     */
    // const router = useIonRouter();

    /**
     * Toast notification hook
     */
    const showToast = useToast();

    /**
     * Loading spinner context
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * Cart context for updating cart after order
     */
    const { updateBoxes, updateSlices, totalBoxes, totalSlices } = useCartContext();

    /**
     * Current step: 'info' or 'payment'
     */
    const [currentStep, setCurrentStep] = useState<'info' | 'payment'>('info');

    /**
     * Guest info collected from form
     */
    const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);

    /**
     * Applied promo code (retrieved from localStorage)
     */
    const promoApplied: PromoValidationResult['promotion'] | null = (() => {
        const storedPromo = localStorage.getItem('appliedPromoCode');
        return storedPromo ? JSON.parse(storedPromo) : null;
    })();

    /**
     * Calculates the final order total including promo discount
     * @returns Final total amount in Fcfa
     */
    const calculateTotal = () => {
        let total = totalBoxes + totalSlices;

        if (promoApplied) {
            total -= (promoApplied.discount_amount || promoApplied.calculated_discount || 0);
        }

        return Math.max(0, total);
    };

    /**
     * Prepares cart data for API
     */
    const prepareCartData = () => {
        const guestCart = getGuestCart();
        const cartItems: any[] = [];

        guestCart.boxes.forEach(box => {
            cartItems.push({
                type: 'box',
                box_type_id: box.box_type_id,
                quantity: 1,
                // Composition chosen by the guest — persisted server-side as BoxSlice rows
                slices: (box.slices ?? []).map(box_slice => ({
                    slice_id: box_slice.slice_id,
                    quantity: box_slice.quantity
                }))
            });
        });

        guestCart.slices.forEach(slice => {
            cartItems.push({
                type: 'slice',
                slice_id: slice.slice_id,
                quantity: slice.quantity
            });
        });

        return cartItems;
    };

    /**
     * Submits the guest order with cash on delivery
     */
    const submitCashOrder = async () => {
        if (!guestInfo) return;

        setShowSpinner(true);
        const orderStringId = SHA256_Encrypt(formatDate(new Date(), 'full', true, 'full'));
        const cartItems = prepareCartData();
        const coords = await captureDeliveryCoordinates();

        const data: any = {
            order_id: orderStringId,
            guest_first_name: guestInfo.firstName,
            guest_last_name: guestInfo.lastName,
            guest_phone_number: guestInfo.phoneNumber,
            guest_email: guestInfo.email || '',
            address: guestInfo.address,
            montant: calculateTotal(),
            cart_items: cartItems,
            ...(coords ?? {}),
        };

        if (promoApplied) {
            // The API reads `promotion_code` (see OrderController@addGuestOrder)
            data.promotion_code = promoApplied.code;
        }

        api.post('/guest-order', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if ((res.status === 200 || res.status === 201) && res.data.message) {
                setShowSpinner(false);
                showToast(t(res.data.message));

                clearGuestCart();
                localStorage.removeItem('appliedPromoCode');
                updateBoxes([]);
                updateSlices([]);

                // Use the order reference from API response
                const orderRef = res.data.order?.string_id || orderStringId;
                localStorage.setItem('guest_order_reference', orderRef);
                window.location.href = `/guest-order-success/${orderRef}`;
            } else {
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.dir(error);
        });
    };

    /**
     * Submits the guest order with PayTech payment
     */
    const submitPayTechOrder = async () => {
        if (!guestInfo) return;

        setShowSpinner(true);
        const orderStringId = SHA256_Encrypt(formatDate(new Date(), 'full', true, 'full'));
        const cartItems = prepareCartData();
        const coords = await captureDeliveryCoordinates();

        const requestTokenUrl = process.env.NODE_ENV === "production"
            ? 'https://api.profood-app.com/api/guest-order-with-payment'
            : 'http://localhost:8000/api/guest-order-with-payment';

        const paymentData: any = {
            order_id: orderStringId,
            guest_first_name: guestInfo.firstName,
            guest_last_name: guestInfo.lastName,
            guest_phone_number: guestInfo.phoneNumber,
            guest_email: guestInfo.email || '',
            address: guestInfo.address,
            montant: calculateTotal(),
            cart_items: cartItems,
            ...(coords ?? {}),
        };

        if (promoApplied) {
            // The API reads `promotion_code` (see OrderController@addGuestOrderWithPayment)
            paymentData.promotion_code = promoApplied.code;
        }

        // Store order info for after payment
        localStorage.setItem('guest_order_id', orderStringId);

        new window.PayTech(paymentData)
            .withOption({
                requestTokenUrl: requestTokenUrl,
                method: "POST",
                headers: {
                    Accept: "text/html",
                    'Content-Type': 'application/json'
                },
                prensentationMode: window.PayTech.OPEN_IN_SAME_TAB,
                willGetToken: function () {
                    setShowSpinner(true);
                },
                didGetToken: function (pt_token: string, redirectUrl: string) {
                    // The cart is NOT cleared here: the payment hasn't happened
                    // yet. GuestOrderSuccess clears it after PayTech redirects
                    // back, so an abandoned payment keeps the cart intact.
                    localStorage.setItem('guest_order_reference', orderStringId);
                    console.log(pt_token + " " + redirectUrl);
                    setTimeout(() => setShowSpinner(false), 6000);
                },
                didReceiveError: function (error: any) {
                    setShowSpinner(false);
                    showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`, 2000);
                    console.log(error);
                },
                didReceiveNonSuccessResponse: function (jsonResponse: any) {
                    setShowSpinner(false);
                    showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`, 2000);
                    console.log(jsonResponse);
                },
            })
            .send();
    };

    /**
     * Handles guest form submission - moves to payment step
     */
    const handleFormSubmit = (info: GuestInfo) => {
        setGuestInfo(info);
        setCurrentStep('payment');
    };

    /**
     * Handles payment method selection
     */
    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        if (method === 'cash') {
            submitCashOrder();
        } else {
            submitPayTechOrder();
        }
    };

    /**
     * Handles form cancellation - navigates back to cart
     */
    const handleFormCancel = () => {
        window.location.href = '/views/cart';
    };

    /**
     * Navigates back (to previous step or cart)
     */
    const goBack = () => {
        if (currentStep === 'payment') {
            setCurrentStep('info');
        } else {
            window.location.href = '/views/cart';
        }
    };

    /**
     * Navigates to login page with return URL
     */
    const goToLogin = () => {
        window.location.href = '/signin?returnUrl=/views/cart';
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={goBack}>
                            <IonIcon icon={arrowBackOutline} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="title-color">
                        {currentStep === 'info' ? t('Commander sans compte') : t('Mode de paiement')}
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="guest-checkout-page-content ion-padding">
                <div className="guest-checkout-container">
                    {currentStep === 'info' ? (
                        <>
                            {/* Login link */}
                            <div className="login-link-section">
                                <span className="content-color font-sm">{t('Vous avez un compte ?')}</span>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    className="login-link-btn"
                                    onClick={goToLogin}
                                >
                                    <span className="font-sm">{t('Connectez-vous')}</span>
                                </IonButton>
                            </div>

                            <IonCard className="guest-checkout-card">
                                <IonCardContent>
                                    <GuestCheckoutForm
                                        onSubmit={handleFormSubmit}
                                        onCancel={handleFormCancel}
                                    />
                                </IonCardContent>
                            </IonCard>
                        </>
                    ) : (
                        <>
                            {/* Payment method selection */}
                            <div className="payment-methods-section">
                                <p className="payment-methods-intro content-color font-sm">
                                    {t('Choisissez votre mode de paiement')}
                                </p>

                                <div className="payment-methods-grid">
                                    {/* Electronic Payment - PayTech */}
                                    <IonCard
                                        button
                                        className="payment-method-card"
                                        onClick={() => handlePaymentMethodSelect('electronic')}
                                    >
                                        <IonCardHeader>
                                            <div className="payment-method-icon-wrapper">
                                                <img
                                                    src={toAbsolutePublicUrl('/media/images/illustrations/payment-methods/mobile-payment.png')}
                                                    alt="Paiement électronique"
                                                    className="payment-method-image"
                                                />
                                            </div>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <IonCardTitle className="payment-method-title">
                                                {t('Paiement électronique')}
                                            </IonCardTitle>
                                            <p className="payment-method-desc content-color font-xs">
                                                {t('Orange Money, Wave, Carte bancaire')}
                                            </p>
                                        </IonCardContent>
                                    </IonCard>

                                    {/* Cash on Delivery */}
                                    <IonCard
                                        button
                                        className="payment-method-card"
                                        onClick={() => handlePaymentMethodSelect('cash')}
                                    >
                                        <IonCardHeader>
                                            <div className="payment-method-icon-wrapper">
                                                <img
                                                    src={toAbsolutePublicUrl('/media/images/illustrations/payment-methods/cash-on-delivery.png')}
                                                    alt="Paiement à la livraison"
                                                    className="payment-method-image"
                                                />
                                            </div>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <IonCardTitle className="payment-method-title">
                                                {t('Paiement à la livraison')}
                                            </IonCardTitle>
                                            <p className="payment-method-desc content-color font-xs">
                                                {t('Payez en espèces à la réception')}
                                            </p>
                                        </IonCardContent>
                                    </IonCard>
                                </div>

                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    color="medium"
                                    className="back-to-info-btn"
                                    onClick={() => setCurrentStep('info')}
                                >
                                    {t('Modifier mes informations')}
                                </IonButton>
                            </div>
                        </>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GuestCheckoutPage;
