import { createContext } from 'react';

/**
 * 
 */
type OrdersMenuTabsContextProps = {
    currentMenuTab: number;
    toggleMenuTab: (tabNumber: number) => void;
}

/**
 * 
 */
const OrdersMenuTabsContext = createContext<OrdersMenuTabsContextProps>({
    currentMenuTab: 1,
    toggleMenuTab: () => {/* */}
});

export default OrdersMenuTabsContext;
