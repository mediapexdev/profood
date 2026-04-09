import React, { useContext, useState } from 'react';

import OrderDetailsMenuTabsContext from './OrderDetailsMenuTabsContext';

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
export const useOrderDetailsMenuTabsContext = () => useContext(OrderDetailsMenuTabsContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const OrderDetailsMenuTabsProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [currentMenuTab, setCurrentMenuTab] = useState<number>(3);

    /**
     * 
     * @param tabNumber 
     * @returns 
     */
    const toggleMenuTab = (tabNumber: number) => setCurrentMenuTab(tabNumber);

    /**
     * 
     */
    return <OrderDetailsMenuTabsContext.Provider value={{ currentMenuTab, toggleMenuTab }}>{children}</OrderDetailsMenuTabsContext.Provider>
};

export default OrderDetailsMenuTabsProvider;
