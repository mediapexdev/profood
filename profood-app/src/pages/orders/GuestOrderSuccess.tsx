import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import {
    IonButton,
    IonContent,
    IonPage,
    useIonRouter,
    useIonViewDidLeave
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import Error404 from "../errors/components/Error404";

import './GuestOrderSuccess.css';

/**
 * Guest Order Success page component.
 * Displays confirmation message for successful guest orders.
 * Provides options to create an account or continue shopping.
 *
 * @returns GuestOrderSuccess page
 */
const GuestOrderSuccess: React.FC = () => {
    /**
     * Translation hook for internationalization
     */
    const { t } = useTranslation();

    /**
     * Router hook for navigation
     */
    const router = useIonRouter();

    /**
     * Route parameters containing order ID
     */
    const { id } = useParams<{ id: string; }>();

    /**
     * State for storing order reference from localStorage
     */
    const [orderReference, setOrderReference] = useState<string>('');

    /**
     * Effect to retrieve order reference from localStorage on mount
     */
    useEffect(() => {
        const reference = localStorage.getItem('guest_order_reference');
        if (reference) {
            setOrderReference(reference);
        }
    }, []);

    /**
     * Cleanup effect to remove order reference from localStorage when leaving page
     */
    useIonViewDidLeave(() => {
        localStorage.removeItem('guest_order_reference');
    });

    /**
     * Navigates to home page for continued shopping
     */
    const goToHome = () => {
        router.push('/', "forward", "pop");
    };

    /**
     * Navigates to signup page for account creation
     */
    const goToSignUp = () => {
        router.push('/signup', "forward", "push");
    };

    /**
     * Validates that the order reference matches the URL parameter
     * to ensure user is viewing the correct order confirmation
     */
    const isValidOrder = orderReference.length > 0 && orderReference === id;

    return (
        <IonPage>
            <IonContent id="guestOrderSuccessContent">
            {
                isValidOrder
                ?
                <div className="guest-order-success ion-padding">
                    <div className="d-flex flex-column flex-center">
                        {/* Success illustration */}
                        <div className="image-wrapper my-5">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/lupuorcc.svg')}
                                alt="Illustration"
                            />
                        </div>

                        <div className="d-flex flex-column flex-center">
                            {/* Success title */}
                            <div className="d-flex flex-row flex-center mb-2">
                                <h1 className="guest-order-success-title title-color font-lg fw-semibold text-center m-0">
                                    {t('Nous vous remercions pour votre commande !')}
                                </h1>
                            </div>

                            {/* Order reference information */}
                            <div className="d-flex flex-row flex-center mb-3">
                                <p className="guest-order-success-text font-sm content-color text-center m-0">
                                    {t('Votre commande a été passée avec succès. Votre numéro de commande est')} #{orderReference.substring(0, 12)}
                                </p>
                            </div>

                            {/* Additional information for guest users */}
                            <div className="d-flex flex-row flex-center mb-8">
                                <p className="guest-order-info-text font-xs content-color text-center m-0">
                                    {t('Créez un compte pour suivre votre commande et profiter de tous nos services')}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="btn-wrapper d-flex flex-column flex-center w-100">
                                {/* Create account button */}
                                <div className="mb-3 w-100">
                                    <IonButton
                                        buttonType="button"
                                        fill="solid"
                                        size="default"
                                        color="primary"
                                        expand="block"
                                        className="text-transform-none"
                                        onClick={goToSignUp}
                                    >
                                        <span style={{color: '#fff'}}>{t('Créer un compte')}</span>
                                    </IonButton>
                                </div>

                                {/* Continue shopping button */}
                                <div className="w-100">
                                    <IonButton
                                        buttonType="button"
                                        fill="solid"
                                        size="default"
                                        color="light"
                                        expand="block"
                                        className="text-transform-none"
                                        onClick={goToHome}
                                    >
                                        <span>{t('Continuer mes achats')}</span>
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <Error404 />
            }
            </IonContent>
        </IonPage>
    );
};

export default GuestOrderSuccess;
