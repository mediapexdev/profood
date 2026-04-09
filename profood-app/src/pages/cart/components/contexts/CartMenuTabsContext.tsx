import { createContext } from 'react';

/**
 * 
 */
type CartMenuTabsContextProps = {
    currentMenuTab: number;
    toggleMenuTab: (tabNumber: number) => void;
}

/**
 * 
 */
const CartMenuTabsContext = createContext<CartMenuTabsContextProps>({
    currentMenuTab: 1,
    toggleMenuTab: () => {}
});

export default CartMenuTabsContext;
