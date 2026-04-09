import React from "react";

import { useOrdersContext } from "../components/contexts/OrdersProvider";
import { useOrdersMenuTabs } from "../components/contexts/OrdersMenuTabsProvider";
import { useUserInfosContext } from "../../../contexts/UserInfosProvider";
import Unavailable from "../Unavailable";
import OrderList from "../components/OrderList";
// import SuccessfulOrder from "./SuccessfulOrder";

import './Body.css';

/**
 * 
 * @returns 
 */
const Body: React.FC = () => {
    /**
     * 
     */
    const { logged } = useUserInfosContext();

    /**
     * 
     */
    const { getOrders } = useOrdersContext();

    /**
     * 
     */
    const { currentMenuTab } = useOrdersMenuTabs();

    /**
     * 
     */
    return(
        logged
        ?
        <OrderList orders={getOrders((2 === currentMenuTab) ? 'current' : ((3 === currentMenuTab) ? 'delivered' : 'all' ))} />
        :
        <Unavailable />
        // <SuccessfulOrder />
    );
};

export default Body;
