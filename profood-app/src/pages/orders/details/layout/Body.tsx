import React from "react";

import OrderBoxList from "../../components/boxes/OrderBoxList";
import OrderSliceList from "../../components/slices/OrderSliceList";
import OrderPaymentDetails from "../../components/OrderPaymentDetails";
import { OrderProps } from "../../components/Order";
import { useOrderDetailsMenuTabsContext } from "../../components/contexts/OrderDetailsMenuTabsProvider";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";
import Unavailable from "../../Unavailable";

import './Body.css';

/**
 * 
 * @param order 
 * @returns 
 */
const Body: React.FC<OrderProps> = (order: OrderProps) => {
    /**
     * 
     */
    const { logged } = useUserInfosContext();

    /**
     * 
     */
    const { currentMenuTab } = useOrderDetailsMenuTabsContext();

    if(logged){
        return (
            <div className="content-body">
            {getTabView(currentMenuTab, order)}
            </div>
        );
    }
    else {
        return(
            <Unavailable />
        );
    }
};

/**
 * 
 * @param index 
 * @param viewedOrder 
 * @returns 
 */
function getTabView(index: number, viewedOrder: OrderProps) {

    switch(index){
        case 1:
            return <OrderBoxList boxes={viewedOrder.cart.boxes_data} />;
        case 2:
            return <OrderSliceList slices={viewedOrder.cart.slices_data} />;
        case 3:
        default:
            return (
                <div className="order-payment-details-wrapper">
                    <OrderPaymentDetails order={viewedOrder} />
                </div>
            );
    }
}

export default Body;
