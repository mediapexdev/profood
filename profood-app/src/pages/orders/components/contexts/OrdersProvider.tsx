import React, { useCallback, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import { OrderProps } from "../Order";
import OrdersContext, { OrderStatusWording, OrdersContextType } from "./OrdersContext";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";
import { useLoadingSpinnerContext } from "../../../../contexts/LoadingSpinnerProvider";

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
export const useOrdersContext = () => useContext(OrdersContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const OrdersProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [orders, setOrders] = useState<OrderProps[]>([]);

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { userId } = useUserInfosContext();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const fetchOrders = useCallback(() => {

        const token = localStorage.getItem('token');

        if(token !== null && userId > 0){
            setShowSpinner(true);

            api.get(`/get-customer-orders-by-user/${userId}`, {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setOrders(res.data);
                setShowSpinner(false);
                // console.log(res.data)
            }).catch((error) => {
                setShowSpinner(false);
                showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            });
        }
    }, [setShowSpinner, showToast, userId]);

    /**
     * 
     */
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders, userId])

    /**
     * 
     * @param param 
     * @returns 
     */
    const getOrderCount = useCallback((param: OrderStatusWording) => {

        if(!orders.length || param === 'all'){
            return orders.length;
        }
        let orders_count = 0;

        orders.forEach((order) => {
            if(order.status.wording.toLowerCase() === param ||
                (param === 'current' && [8, 16, 32].includes(order.status.code))){
                orders_count += Number(1);
            }
        });
        return orders_count;
    }, [orders]);

    /**
     * 
     * @param param 
     * @returns 
     */
    const getOrders = useCallback((param: OrderStatusWording) => {

        if(!orders.length || param === 'all'){
            return orders;
        }
        return orders.filter((order) => {
            return order.status.wording.toLowerCase() === param ||
                (param === 'current' && [8, 16, 32].includes(order.status.code));
        });
    }, [orders]);

    /**
     * Define the context value
     */
    const contextValue: OrdersContextType = {
        orders,
        fetchOrders,
        getOrderCount,
        getOrders,
        setOrders
    };
    return <OrdersContext.Provider value={contextValue}>{children}</OrdersContext.Provider>;
};

export default OrdersProvider;
