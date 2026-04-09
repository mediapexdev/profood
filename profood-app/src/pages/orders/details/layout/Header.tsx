import React from 'react';

import {
    IonButtons,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonButton
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { OrderProps } from '../../components/Order';
import GoToHomeButton from '../../../../components/widgets/GoToHomeButton';
import { useLoadingSpinnerContext } from '../../../../contexts/LoadingSpinnerProvider';
import { useOrdersContext } from '../../components/contexts/OrdersProvider';
import { useUserInfosContext } from '../../../../contexts/UserInfosProvider';
import useGoToOrders from '../../../../components/hooks/useGoToOrders';

import './Header.css';

/**
 * 
 * @param order 
 * @returns 
 */
const Header: React.FC<OrderProps> = (order: OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goToOrders = useGoToOrders();

    /**
     * 
     */
    const { fetchOrders } = useOrdersContext();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { id: customerId } = useUserInfosContext();

    /**
     * 
     */
    const cancelOrder = () => {

        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            'customer_id': customerId,
            "order_id": order.id,
            "app_key": process.env.REACT_APP_KEY
        };
        api.post('/cancel-order', data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message));
                fetchOrders();
                // setTimeout(() => {
                //     setShowSpinner(false);
                // }, 600);
                setTimeout(() => setShowSpinner(false) , 400);
                goToOrders('forward', 'push');
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            console.log(error);
        });
    };

    return (
        <IonHeader
            translucent={true}
            id='orderDetailsPageHeader'
            className='page-header'
        >
            {/* begin::Toolbar */}
            <IonToolbar>
                {/* begin::Back button */}
                <IonButtons slot="start">
                    <IonBackButton defaultHref='/' />
                </IonButtons>
                {/* end::Back button */}

                {/* begin::Title */}
                <IonTitle className='title-color text-center'>{t('Détails')}</IonTitle>
                {/* end::Title */}

                {/* begin::Go to home button */}
                <IonButtons slot="end">
                    <GoToHomeButton />
                </IonButtons>
                {/* end::Go to home button */}
            </IonToolbar>
            {/* end::Toolbar */}
            {/* begin::Toolbar */}
        {
            (order.status.code === 8 ||
                order.payment_status.code === 8) &&
            <IonToolbar className='personal'>
                <IonButtons className='flex-center'>
                {
                    order.status.code === 8 &&
                    <IonButton
                        type='button'
                        buttonType='button'
                        fill='clear'
                        size='small'
                        color='danger'
                        className='btn-cancel text-transform-none'
                        onClick={cancelOrder}
                    >
                        <span>{t('Annuler la commande')}</span>
                    </IonButton>
                }
                {/* {
                    order.payment_status.code === 8 &&
                    <IonButton
                        type='button'
                        buttonType='button'
                        fill='clear'
                        size='small'
                        color='primary'
                        className='btn-invoice text-transform-none'
                        // onClick={() => {
                        //     setShowSpinner(true);
                        //     setTimeout(() => setShowSpinner(false) , 400);
                        //     goTo(`/orders/${order.string_id}`, 'forward', 'push');
                        // }}
                    >
                        <span>{t('Télécharger la facture')}</span>
                    </IonButton>
                } */}
                </IonButtons>
            </IonToolbar>
        }
            {/* end::Toolbar */}
        </IonHeader>
    );
};

export default Header;
