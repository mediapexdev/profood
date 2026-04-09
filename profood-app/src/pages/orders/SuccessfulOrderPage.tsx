import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { IonButton, IonContent, IonPage, useIonRouter, useIonViewDidLeave } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import Error404 from "../errors/components/Error404";

import './SuccessfulOrderPage.css';

/**
 * 
 * @returns 
 */
const SuccessfulOrderPage: React.FC = () => {
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
    const navigate = useIonRouter();

    /**
     * 
     */
    const goToOrders = () => {
        navigate.push('/views/orders', "forward", "pop");
    };

    /**
     * 
     */
    return(
        <IonPage>
            {/* <Header /> */}
            <IonContent id="successfulOrderPageContent">
            {
                (orderId?.length && orderId === id)
                ?
                <div className="successful-order ion-padding">
                    <div className="d-flex flex-column flex-center">
                        <div className="image-wrapper my-5">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/lupuorcc.svg')}
                                alt="Illustration"
                            />
                        </div>
                        <div className="d-flex flex-column flex-center">
                            <div className="d-flex flex-row flex-center mb-2">
                                <h1 className="successful-order-title title-color font-lg fw-semibold text-center m-0">{t('Nous vous remercions pour votre commande !')}</h1>
                            </div>
                            <div className="d-flex flex-row flex-center mb-8">
                                <p className="successful-order-text font-sm content-color text-center m-0">{t('Votre commande a été passée avec succès. Votre numéro de commande est')} #548475151</p>
                            </div>
                            <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                                <IonButton
                                    buttonType="button"
                                    fill="solid"
                                    size="default"
                                    className="text-transform-none"
                                    onClick={() => {
                                        localStorage.removeItem('order_id')
                                        goToOrders();
                                    }}
                                >
                                    <span>{t('Suivi de la commande')}</span>
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

export default SuccessfulOrderPage;
