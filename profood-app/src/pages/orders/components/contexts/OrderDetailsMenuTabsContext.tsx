import { createContext } from 'react';

/**
 * 
 */
type OrderDetailsMenuTabsContextProps = {
    currentMenuTab: number;
    toggleMenuTab: (tabNumber: number) => void;
}

/**
 * 
 */
const OrderDetailsMenuTabsContext = createContext<OrderDetailsMenuTabsContextProps>({
    currentMenuTab: 1,
    toggleMenuTab: () => {/* */}
});

export default OrderDetailsMenuTabsContext;
