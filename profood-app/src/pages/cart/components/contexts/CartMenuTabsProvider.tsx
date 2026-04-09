import React, { useContext, useState } from 'react';

import CartMenuTabsContext from './CartMenuTabsContext';

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
export const useCartMenuTabsContext = () => useContext(CartMenuTabsContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const CartMenuTabsProvider = ({ children }: Props) => {
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
    return <CartMenuTabsContext.Provider value={{ currentMenuTab, toggleMenuTab }}>{children}</CartMenuTabsContext.Provider>
};

export default CartMenuTabsProvider;
