import React from 'react';

import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { toAbsolutePublicUrl } from '../../../../helpers/AssetHelpers';

import './OrderFinalizationModal.css';

/**
 * 
 */
interface PaymentMethod {
    id: string;
    title: string;
    illustration: string;
    onClick: () => void;
}

/**
 * 
 */
interface OrderFinalizationModalProps{
    onDismiss: (role?: 'cancel' | 'confirm', selection?: 16 | 32) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const OrderFinalizationModal: React.FC<OrderFinalizationModalProps> = ({ onDismiss }: OrderFinalizationModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const PaymentMethods: PaymentMethod[] = [
        {
            id: 'electronic',
            title: t('Électronique'),
            illustration: 'mobile-payment.png',
            // onClick: () => onDismiss('confirm', 16)
            onClick: () => {/* */}
        },
        {
            id: 'cashOnDelivery',
            title: t('Paiement à la Livraison'),
            illustration: 'cash-on-delivery.png',
            onClick: () => onDismiss('confirm', 32)
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className='title-color font-lg'>{t("Mode de paiement")}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            type='button'
                            buttonType='button'
                            color="medium"
                            size='small'
                            onClick={() => onDismiss('cancel')}
                        >
                            <IonIcon
                                size='default'
                                slot="icon-only"
                                icon={close}
                            />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent
                id='orderFinalizationModalContent'
                className="ion-padding"
            >
                <IonGrid className="payment-methods-list-widget">
                    <IonRow>
                    {
                        PaymentMethods.map((method, index) => (
                            <IonCol
                                size="12" size-sm="6" size-md='6' size-lg='6' size-xl='6'
                                key={index}
                            >
                                <IonCard
                                    button={index !== 0}
                                    className="payment-method-widget card h-100"
                                    onClick={method.onClick}
                                    disabled={index === 0}
                                >
                                    <div
                                        className='overlay'
                                        data-text={t('Bientôt disponible')}
                                    ></div>
                                    <IonCardHeader className="card-header d-flex align-items-start justify-content-center">
                                        <div className="payment-method-image-wrapper">
                                            <img
                                                className="payment-method-image img-fluid"
                                                src={toAbsolutePublicUrl(`/media/images/illustrations/payment-methods/${method.illustration}`)}
                                                alt='Illustration'
                                            />
                                        </div>
                                    </IonCardHeader>
                                    <IonCardContent className="card-body">
                                        <IonCardTitle className="payment-method-title payment-method-widget-title title-color font-md">{method.title}</IonCardTitle>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        ))
                    }
                        <IonCol size="12" size-sm="12" size-md='12' size-lg='12' size-xl='12'>
                            <div className='mt-10'>
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    fill='solid'
                                    size='default'
                                    color='primary'
                                    expand='block'
                                    className='btn-cancel text-transform-none'
                                    onClick={() => onDismiss('cancel')}
                                >
                                    <span style={{color: '#fff'}}>{t('Annuler')}</span>
                                </IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default OrderFinalizationModal;
