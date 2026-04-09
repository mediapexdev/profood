import React, { useEffect, useState } from 'react';

import {
    IonButtons,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useOrdersContext } from '../components/contexts/OrdersProvider';
import { useOrdersMenuTabs } from '../components/contexts/OrdersMenuTabsProvider';
import { useUserInfosContext } from '../../../contexts/UserInfosProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';
import { reload } from 'ionicons/icons';

import './Header.css';

/**
 * 
 * @returns 
 */
const Header: React.FC = () => {
    /**
     * 
     */
    const { logged } = useUserInfosContext();

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { fetchOrders, getOrderCount } = useOrdersContext();

    /**
     * 
     */
    const { currentMenuTab } = useOrdersMenuTabs();

    /**
     * 
     */
    const [ordersCount, setOrdersCount] = useState<number>(0);
    const [ordersCountText, setOrdersCountText] = useState<string>('');

    /**
     * 
     */
    useEffect(() => {
        if(logged){

            let text = '';
            let orders_count = 0;
            text = (orders_count === 1) ? 'commande en cours' : 'commandes en cours';

            if(2 === currentMenuTab){
                orders_count = getOrderCount('current');
                // text = (orders_count > 1) ? 'commandes en cours' : 'commande en cours';
                text = (orders_count === 1) ? 'commande en cours' : 'commandes en cours';
            }
            else if(3 === currentMenuTab){
                orders_count = getOrderCount('delivered');
                // text = (orders_count > 1) ? 'commandes livrées' : 'commande livrée';
                text = (orders_count === 1) ? 'commande livrée' : 'commandes livrées';
            }
            else{
                orders_count = getOrderCount('all');
                // text = (orders_count > 1) ? 'commandes passées' : 'commande passée';
                text = (orders_count === 1) ? 'commande passée' : 'commandes passées';
            }
            setOrdersCount(orders_count);
            setOrdersCountText(text);
        }
    }, [currentMenuTab, getOrderCount, logged])

    return (
        <IonHeader
            translucent={true}
            className='orders-page-header'
        >
            {/* begin::Toolbar */}
            <IonToolbar>
                {/* begin::Back button */}
                <IonButtons slot="start">
                    <IonBackButton defaultHref='/' />
                </IonButtons>
                {/* end::Back button */}
                {/* begin::Title */}
                <IonTitle className='title-color text-sm-center ps-sm-0'>{t("Mes commandes")}</IonTitle>
                {/* end::Title */}
            </IonToolbar>
            {/* end::Toolbar */}
            {/* begin::Toolbar */}
        {
            logged &&
            <IonToolbar className='orders-info-toolbar px-2'>
                <div className='px-2'>
                    <div className="orders-info d-flex flex-row align-items-center justify-content-start">
                        <IonBadge className="orders-count">{formatNumber(ordersCount)}</IonBadge>
                        <IonLabel className="order-count-text">{ordersCountText.length === 0 ? '' : t(ordersCountText)}</IonLabel>
                    </div>
                </div>
                {/* begin::Buttons */}
                <IonButtons slot="end">
                    <div style={{padding: '0 5px'}}>
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='solid'
                            size='small'
                            color='dark'
                            slot='icon-only'
                            id='btnRefreshOrders'
                            className='btn-refresh m-0'
                            style={{minHeight: '28px'}}
                            onClick={fetchOrders}
                        >
                            <IonIcon icon={reload} />
                        </IonButton>
                    </div>
                </IonButtons>
                {/* end::Buttons */}
            </IonToolbar>
        }
            {/* end::Toolbar */}
        </IonHeader>
    );
};

export default Header;
