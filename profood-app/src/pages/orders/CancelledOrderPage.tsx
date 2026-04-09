import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { IonButton, IonContent, IonPage, useIonViewDidLeave } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import useGoToCart from "../../components/hooks/useGoToCart";
import Error404 from "../errors/components/Error404";

import './CancelledOrderPage.css';

/**
 * 
 * @returns 
 */
const CancelledOrderPage: React.FC = () => {
    /**
     * 
     */
    const [orderId, setOrderId] = useState<string>('');

    /**
     * 
     */
    useEffect(() => {
        setOrderId(localStorage.getItem('order_id') as string);
    }, []);

    /**
     * 
     */
    useIonViewDidLeave(() => {
        localStorage.removeItem('order_id');
        setOrderId('');
    });

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { id } = useParams<{ id: string; }>();

    /**
     * 
     */
    const goToCart = useGoToCart();

    /**
     * 
     */
    return(
        <IonPage>
            {/* <Header /> */}
            <IonContent id="cancelledOrderPageContent">
            {
                (orderId && orderId.length > 0 && orderId === id)
                ?
                <div className="cancelled-order ion-padding">
                    <div className="d-flex flex-column flex-center">
                        <div className="image-wrapper my-5">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                                alt="Illustration"
                            />
                        </div>
                        <div className="d-flex flex-column flex-center">
                            <div className="d-flex flex-row flex-center mb-8">
                                <h1 className="cancelled-order-title title-color font-lg fw-semibold text-center m-0">{t('Commande annulée !')}</h1>
                            </div>
                            <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                                <IonButton
                                    buttonType="button"
                                    fill="solid"
                                    size="default"
                                    className="text-transform-none"
                                    onClick={() => {
                                        localStorage.removeItem('order_id')
                                        setOrderId('');
                                        goToCart('none', 'pop');
                                    }}
                                >
                                    <span>{t('Retour')}</span>
                                </IonButton>
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

export default CancelledOrderPage;
