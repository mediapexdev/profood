import { createContext } from "react";

import { OrderProps } from "../Order";

/**
 * 
 */
export type OrderStatusWording = 'all' | 'being processed' | 'cancelled' | 'current' | 'delivered' | 'in the process of delivery' | 'awaiting processing';

/**
 * 
 */
export type OrdersContextType = {
    orders: OrderProps[];
    fetchOrders: () => void;
    getOrderCount: (param: OrderStatusWording) => number;
    getOrders: (param: OrderStatusWording) => OrderProps[];
    setOrders: (orders: OrderProps[]) => void;
}

/**
 * Create the orders context
 */
const OrdersContext = createContext<OrdersContextType>({
    orders: [],
    fetchOrders: () => {/* */},
    getOrderCount: () => 0,
    getOrders: () => [],
    setOrders: () => {/* */},
});

export default OrdersContext;
