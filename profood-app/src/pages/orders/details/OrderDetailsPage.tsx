import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { IonContent, IonPage } from '@ionic/react';

import Header from './layout/Header';
import Body from './layout/Body';
import Footer from './layout/Footer';
import { useOrdersContext } from '../components/contexts/OrdersProvider';
import OrderDetailsMenuTabsProvider from '../components/contexts/OrderDetailsMenuTabsProvider';
import { OrderProps } from '../components/Order';
import NotFoundPage from '../../errors/NotFoundPage';

import './OrderDetailsPage.css';

/**
 * 
 * @returns 
 */
const OrderDetailsPage: React.FC = () => {
    /**
     * 
     */
    const { id } = useParams<{ id?: string; }>();

    /**
     * 
     */
    const { orders } = useOrdersContext();

    /**
	 * 
	 */
    const [selectedOrder, setSelectedOrder] = useState<OrderProps|undefined>(undefined);

    /**
     * 
     */
    useEffect(() => {
        setSelectedOrder(orders.find((o) => o.string_id === id))
	}, [orders, id]);

    return (
        selectedOrder === undefined
        ?
        <NotFoundPage />
        :
        <OrderDetailsMenuTabsProvider>
            <IonPage id='orderDetailsPage'>
                <Header {...selectedOrder} />
                <IonContent className='ion-padding'>
                    <Body {...selectedOrder} />
                </IonContent>
                <Footer />
            </IonPage>
        </OrderDetailsMenuTabsProvider>
    );
};

export default OrderDetailsPage;
