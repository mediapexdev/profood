import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import moment from "moment";

import api from "../../api/api";
import DataContext, { DataContextType } from "./DataContext";
import {
    BoxTypeProps,
    CategoryProps,
    CustomDateRange,
    CustomerProps,
    Livreur,
    OrderPaymentStatus,
    OrderProps,
    OrderStatus,
    BestSellersReport,
    OrdersStatisticsDetails,
    PromotionProps,
    SliceProps,
    UserProps,
    UserRoleProps
} from "../../types";
import { useLoadingSpinnerContext } from "./LoadingSpinnerProvider";
import useToast from "../hooks/useToast";

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
export const useDataContext = () => useContext(DataContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const DataProvider = ({ children }: Props) => {
    /**
     *
     */
    const [boxTypes, setBoxTypes] = useState<BoxTypeProps[]>([]);
    const [categories, setCategories] = useState<CategoryProps[]>([]);
    const [customers, setCustomers] = useState<CustomerProps[]>([]);
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [orderPaymentStatuses, setOrderPaymentStatuses] = useState<OrderPaymentStatus[]>([]);
    const [ordersStatisticsDetails, setOrdersStatisticsDetails] = useState<OrdersStatisticsDetails|undefined>(undefined);
    const [bestSellers, setBestSellers] = useState<BestSellersReport|undefined>(undefined);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
    const [promotions, setPromotions] = useState<PromotionProps[]>([]);
    const [slices, setSlices] = useState<SliceProps[]>([]);
    const [users, setUsers] = useState<UserProps[]>([]);
    const [userRoles, setUserRoles] = useState<UserRoleProps[]>([]);
    const [statisticsCustomDateRange, setStatisticsCustomDateRange] = useState<CustomDateRange>('last_30_days');
    const [statisticsStartDate, setStatisticsStartDate] = useState<Date|null>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return d;
    });
    const [statisticsEndDate, setStatisticsEndDate] = useState<Date|null>(new Date());

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchBoxTypes = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-box-types', {
                params: { per_page: 100 },
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setBoxTypes(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchCategories = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-categories-with-slices-count', {
                params: { per_page: 100 },
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setCategories(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchCustomers = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-customers-with-linked-users', {
                params: { per_page: 100 },
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setCustomers(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * Fetch all livreurs from the API. Mirrors the fetchCustomers pattern exactly.
     *
     * @param showSpinner
     * @param spinnerTime
     */
    const fetchLivreurs = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-livreurs', {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setLivreurs(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     *
     * @param showSpinner
     * @param spinnerTime
     */
    const fetchOrders = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-orders', {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setOrders(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchOrderPaymentStatuses = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        // if(token && userId > 0){
        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-order-payment-statuses', {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setOrderPaymentStatuses(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param startDate 
     * @param endDate 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchOrdersStatisticsDetails = useCallback((startDate: Date|null = null,
        endDate: Date|null = null, showSpinner: boolean = true, spinnerTime: number = 300) => {

        let start_date = null;
        let end_date = null;

        if(startDate !== null){
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() < 9 ? `0${startDate.getMonth() + 1}` : startDate.getMonth() + 1;
            const startDay = startDate.getDate() < 10 ? `0${startDate.getDate()}` : startDate.getDate();
            start_date = `${startYear}-${startMonth}-${startDay}`
        }
        if(endDate !== null){
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth() < 9 ? `0${endDate.getMonth() + 1}` : endDate.getMonth() + 1;
            const endDay = endDate.getDate() < 10 ? `0${endDate.getDate()}` : endDate.getDate();
            end_date = `${endYear}-${endMonth}-${endDay}`
        }
        const token = localStorage.getItem('token');

        // if(token && userId > 0){
        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-orders-statistics-details', {
                headers:{
                  Authorization:`Bearer ${token}`,
                },
                params: {
                    start_date: start_date,
                    end_date: end_date
                }
            }).then((res) => {
                setOrdersStatisticsDetails(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * Fetch the best-sellers report for a date range (read-only).
     */
    const fetchBestSellers = useCallback((startDate: Date|null = null,
        endDate: Date|null = null, showSpinner: boolean = false, spinnerTime: number = 300) => {

        let start_date = null;
        let end_date = null;

        if(startDate !== null){
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() < 9 ? `0${startDate.getMonth() + 1}` : startDate.getMonth() + 1;
            const startDay = startDate.getDate() < 10 ? `0${startDate.getDate()}` : startDate.getDate();
            start_date = `${startYear}-${startMonth}-${startDay}`
        }
        if(endDate !== null){
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth() < 9 ? `0${endDate.getMonth() + 1}` : endDate.getMonth() + 1;
            const endDay = endDate.getDate() < 10 ? `0${endDate.getDate()}` : endDate.getDate();
            end_date = `${endYear}-${endMonth}-${endDay}`
        }
        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-best-sellers', {
                headers:{
                  Authorization:`Bearer ${token}`,
                },
                params: {
                    start_date: start_date,
                    end_date: end_date,
                    limit: 10
                }
            }).then((res) => {
                setBestSellers(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                if(showSpinner){
                    setShowSpinner(false);
                }
                console.log(error);
            });
        }
    }, [setShowSpinner]);

    /**
     *
     * @param showSpinner
     * @param spinnerTime
     */
    const fetchOrderStatuses = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        // if(token && userId > 0){
        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-order-statuses', {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setOrderStatuses(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     *
     * @param showSpinner
     * @param spinnerTime
     */
    const fetchPromotions = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/promotions', {
                params: { per_page: 100 },
                headers:{
                    Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setPromotions(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     *
     * @param showSpinner
     * @param spinnerTime
     */
    const fetchSlices = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-slices', {
                params: { per_page: 100 },
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setSlices(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchUserRoles = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-roles', {
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setUserRoles(res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     * @param showSpinner 
     * @param spinnerTime 
     */
    const fetchUsers = useCallback((showSpinner: boolean = true, spinnerTime: number = 300) => {

        const token = localStorage.getItem('token');

        if(token !== null){
            if(showSpinner){
                setShowSpinner(true);
            }
            api.get('/get-users-without-customers', {
                params: { per_page: 100 },
                headers:{
                  Authorization:`Bearer ${token}`,
                }
            }).then((res) => {
                setUsers(res.data.data ?? res.data);
                setTimeout(() => {
                    if(showSpinner){
                        setShowSpinner(false);
                    }
                }, spinnerTime);
            }).catch((error) => {
                setShowSpinner(false);
                showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
                console.log(error);
            });
        }
    }, [setShowSpinner, showToast, t]);

    /**
     *
     */
    const fetchData = useCallback(() => {
        if(localStorage.getItem('token') !== null){
            fetchBoxTypes(false);
            fetchCategories(false);
            fetchSlices(false);
            fetchCustomers(false);
            fetchLivreurs(false);
            fetchOrders(false);
            fetchOrderPaymentStatuses(false);
            fetchOrdersStatisticsDetails(null, null, false);
            fetchOrderStatuses(false);
            fetchPromotions(false);
            fetchUserRoles(false);
            fetchUsers(true, 300);
        }
    }, [fetchBoxTypes, fetchCategories, fetchCustomers, fetchLivreurs, fetchOrderPaymentStatuses, fetchOrderStatuses, fetchOrders, fetchOrdersStatisticsDetails, fetchPromotions, fetchSlices, fetchUserRoles, fetchUsers]);

    /**
     * 
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Orders restricted to the selected statistics date range. Period-sensitive
     * dashboard widgets consume this instead of the raw all-time `orders` list so
     * they honour the dashboard date picker. Live/today widgets keep using `orders`.
     */
    const filteredOrders = useMemo(() => {
        const start = statisticsStartDate ? moment(statisticsStartDate).startOf('day') : null;
        const end = statisticsEndDate ? moment(statisticsEndDate).endOf('day') : null;

        if (start === null && end === null) {
            return orders;
        }

        return orders.filter((order) => {
            const orderDate = moment(order.created_at);
            if (start !== null && orderDate.isBefore(start)) {
                return false;
            }
            if (end !== null && orderDate.isAfter(end)) {
                return false;
            }
            return true;
        });
    }, [orders, statisticsStartDate, statisticsEndDate]);

    /**
     * Poll for new orders in the background so the header alert badge stays live
     * without a manual refresh. Skipped when the tab is hidden, when logged out,
     * or while on the orders view (where a wholesale refresh could clobber an
     * in-flight Kanban drag / optimistic status change).
     */
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                return;
            }
            if (!localStorage.getItem('token')) {
                return;
            }
            if (window.location.pathname.startsWith('/commandes')) {
                return;
            }
            fetchOrders(false);
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    /**
     * Define the context value
     */
    const contextValue : DataContextType = {
        boxTypes,
        categories,
        customers,
        livreurs,
        orders,
        filteredOrders,
        orderPaymentStatuses,
        ordersStatisticsDetails,
        bestSellers,
        orderStatuses,
        promotions,
        slices,
        userRoles,
        users,
        statisticsCustomDateRange,
        statisticsEndDate,
        statisticsStartDate,
        fetchBoxTypes,
        fetchCategories,
        fetchCustomers,
        fetchData,
        fetchLivreurs,
        fetchOrders,
        fetchOrderPaymentStatuses,
        fetchOrdersStatisticsDetails,
        fetchBestSellers,
        fetchOrderStatuses,
        fetchPromotions,
        fetchSlices,
        fetchUserRoles,
        fetchUsers,
        setBoxTypes,
        setCategories,
        setCustomers,
        setLivreurs,
        setOrders,
        setOrderPaymentStatuses,
        setOrdersStatisticsDetails,
        setBestSellers,
        setOrderStatuses,
        setPromotions,
        setSlices,
        setUserRoles,
        setUsers,
        setStatisticsCustomDateRange,
        setStatisticsEndDate,
        setStatisticsStartDate
    };

    /**
     * 
     */
    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default DataProvider;
