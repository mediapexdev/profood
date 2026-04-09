import React, { useEffect, useRef } from 'react';

import { IonAlert, useIonRouter,} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useUIStateContext } from '../../contexts/UIStateProvider';

import './ConnectionReminderAlert.css';

/**
 * 
 * @returns 
 */
const ConnectionReminderAlert: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const alert = useRef<HTMLIonAlertElement>(null);

    /**
     *
     */
    const {
        canDismissConnectionAlert,
        canPresentConnectionAlert,
        setCanDismissConnectionAlert,
        setCanPresentConnectionAlert
    } = useUIStateContext();

    /**
     * 
     */
    const dismiss = () => {
        alert.current?.dismiss();
    };

    /**
     * 
     */
    const present = () => {
        alert.current?.present();
    };

    /**
     *
     */
    useEffect(() => {
        if(canDismissConnectionAlert){
            dismiss();
            setCanDismissConnectionAlert(false);
        }
    }, [canDismissConnectionAlert, setCanDismissConnectionAlert]);

    /**
     *
     */
    useEffect(() => {
        if(canPresentConnectionAlert){
            present();
            setCanPresentConnectionAlert(false);
        }
    }, [canPresentConnectionAlert, setCanPresentConnectionAlert]);

    /**
     * 
     */
    const router = useIonRouter();

    /**
     * 
     */
    return (
        <IonAlert
            translucent={true}
            ref={alert}
            id='connectionReminderAlert'
            header="Information"
            message={`${t("Vous devez d'abord vous connecter avant de pouvoir ajouter des produits au panier")}.`}
            buttons={[
                {
                    text: t('Annuler'),
                    role: 'cancel',
                    cssClass: 'alert-btn-cancel',
                    handler: () => {
                        // setHandlerMessage('Alert canceled');
                        dismiss();
                    },
                },
                {
                    text: t('Se connecter'),
                    role: 'confirm',
                    cssClass: 'alert-btn-confirm alert-btn-signin',
                    handler: () => {
                        // setHandlerMessage('Alert confirmed');
                        dismiss();
                        router.push("/signin", "forward", "push");
                    },
                },
            ]}
        >
        </IonAlert>
    );
};

export default ConnectionReminderAlert;
