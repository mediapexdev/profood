import React from "react";

import { IonCol, IonGrid, IonRow } from "@ionic/react";

import NoOrder from "./NoOrder";
import Order, { OrderProps } from "./Order";

/**
 * 
 */
export interface OrderListProps{
    orders: OrderProps[]
}

/**
 * 
 * @param param0 
 * @returns 
 */
const OrderList: React.FC<OrderListProps> = ({orders}: OrderListProps) => {

    return (
        (orders.length > 0)
        ?
        <IonGrid className="order-list-widget">
            <IonRow>
            {
                orders.map((order) => (
                    <IonCol
                        size="12" size-sm="12" size-md='6' size-lg='6' size-xl='4'
                        // size="12" size-sm="6" size-md='6' size-lg='4' size-xl='3'
                        // size="12" size-sm="12" size-md='12' size-lg='12' size-xl='12'
                        key={order.id}
                    >
                        <Order {...order} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
        :
        <NoOrder />
    );
};

export default OrderList;
