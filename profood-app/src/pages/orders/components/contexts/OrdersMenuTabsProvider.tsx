import React, { useContext, useState } from 'react';

import OrdersMenuTabsContext from './OrdersMenuTabsContext';

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useOrdersMenuTabs = () => useContext(OrdersMenuTabsContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const OrdersMenuTabsProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [currentMenuTab, setCurrentMenuTab] = useState<number>(1);

    /**
     * 
     * @param tabNumber 
     * @returns 
     */
    const toggleMenuTab = (tabNumber: number) => setCurrentMenuTab(tabNumber);

    /**
     * 
     */
    return <OrdersMenuTabsContext.Provider value={{ currentMenuTab, toggleMenuTab }}>{children}</OrdersMenuTabsContext.Provider>
};

export default OrdersMenuTabsProvider;
