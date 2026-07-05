import { createContext } from "react";

import {
    BestSellersReport,
    BoxTypeProps,
    CategoryProps,
    CustomDateRange,
    CustomerProps,
    Livreur,
    OrderPaymentStatus,
    OrderProps,
    OrdersStatisticsDetails,
    OrderStatus,
    PromotionProps,
    SliceProps,
    UserProps,
    UserRoleProps
} from '../../types';

/**
 *
 */
export interface DataContextType {
    boxTypes: BoxTypeProps[];
    categories: CategoryProps[];
    customers: CustomerProps[];
    livreurs: Livreur[];
    orders: OrderProps[];
    filteredOrders: OrderProps[];
    orderPaymentStatuses: OrderPaymentStatus[];
    ordersStatisticsDetails?: OrdersStatisticsDetails;
    bestSellers?: BestSellersReport;
    orderStatuses: OrderStatus[];
    promotions: PromotionProps[];
    slices: SliceProps[];
    userRoles: UserRoleProps[];
    users: UserProps[];
    statisticsCustomDateRange: CustomDateRange;
    statisticsStartDate: Date|null;
    statisticsEndDate: Date|null;
    fetchBoxTypes: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchCategories: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchCustomers: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchData: () => void;
    fetchLivreurs: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchOrders: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchOrderPaymentStatuses: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchOrdersStatisticsDetails: (startDate: Date|null, endDate: Date|null, showSpinner?: boolean, spinnerTime?: number) => void;
    fetchBestSellers: (startDate: Date|null, endDate: Date|null, showSpinner?: boolean, spinnerTime?: number) => void;
    fetchOrderStatuses: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchPromotions: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchSlices: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchUserRoles: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchUsers: (showSpinner?: boolean, spinnerTime?: number) => void;
    setBoxTypes: (boxTypes: BoxTypeProps[]) => void;
    setCategories: (categories: CategoryProps[]) => void;
    setCustomers: (customers: CustomerProps[]) => void;
    setLivreurs: (livreurs: Livreur[]) => void;
    setOrders: (orders: OrderProps[]) => void;
    setOrderPaymentStatuses: (statuses: OrderPaymentStatus[]) => void;
    setOrdersStatisticsDetails: (statisticsDetails?: OrdersStatisticsDetails) => void;
    setBestSellers: (report?: BestSellersReport) => void;
    setOrderStatuses: (statuses: OrderStatus[]) => void;
    setPromotions: (promotions: PromotionProps[]) => void;
    setSlices: (slices: SliceProps[]) => void;
    setUserRoles: (roles: UserRoleProps[]) => void;
    setUsers: (users: UserProps[]) => void;
    setStatisticsCustomDateRange: (range: CustomDateRange) => void;
    setStatisticsStartDate: (date: Date|null) => void;
    setStatisticsEndDate: (date: Date|null) => void;
}

/**
 * Create the data context
*/
const DataContext = createContext<DataContextType>({
    boxTypes: [],
    categories: [],
    customers: [],
    livreurs: [],
    orders: [],
    filteredOrders: [],
    orderPaymentStatuses: [],
    ordersStatisticsDetails: undefined,
    bestSellers: undefined,
    orderStatuses: [],
    promotions: [],
    slices: [],
    userRoles: [],
    users: [],
    statisticsCustomDateRange: 'all',
    statisticsStartDate: null,
    statisticsEndDate: null,
    fetchBoxTypes:() => {/* */},
    fetchCategories:() => {/* */},
    fetchCustomers: () => {/* */},
    fetchData:() => {/* */},
    fetchLivreurs: () => {/* */},
    fetchOrders: () => {/* */},
    fetchOrderPaymentStatuses: () => {/* */},
    fetchOrdersStatisticsDetails: () => {/* */},
    fetchBestSellers: () => {/* */},
    fetchOrderStatuses: () => {/* */},
    fetchPromotions: () => {/* */},
    fetchSlices:() => {/* */},
    fetchUsers: () => {/* */},
    fetchUserRoles: () => {/* */},
    setBoxTypes: () => {/* */},
    setCategories: () => {/* */},
    setCustomers: () => {/* */},
    setLivreurs: () => {/* */},
    setOrders: () => {/* */},
    setOrderPaymentStatuses: () => {/* */},
    setOrdersStatisticsDetails : () => {/* */},
    setBestSellers: () => {/* */},
    setOrderStatuses: () => {/* */},
    setPromotions: () => {/* */},
    setSlices: () => {/* */},
    setUsers: () => {/* */},
    setUserRoles: () => {/* */},
    setStatisticsCustomDateRange: () => {/* */},
    setStatisticsStartDate: () => {/* */},
    setStatisticsEndDate: () => {/* */}
});

export default DataContext;
