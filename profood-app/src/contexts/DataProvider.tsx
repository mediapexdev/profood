import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import api from "../api/api";
import DataContext, { DataContextType } from "./DataContext";
import { useLoadingSpinnerContext } from "./LoadingSpinnerProvider";
import { BoxTypeProps } from "../components/box/BoxType";
import { CategoryProps } from "../components/categories/Category";
import { SliceProps } from "../components/slices/Slice";
import useToast from "../components/hooks/useToast";
import { LocalityInfo } from "../pages/cart/components/types";

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
    const { t } = useTranslation();

    /**
     * 
     */
    const [boxTypesProps, setBoxTypesProps] = useState<BoxTypeProps[]>([]);
    const [categoriesProps, setCategoriesProps] = useState<CategoryProps[]>([]);
    const [localities, setLocalities] = useState<LocalityInfo[]>([]);
    const [slicesProps, setSlicesProps] = useState<SliceProps[]>([]);

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * Fetches all box types with pagination support.
     * Uses a high per_page value to get all items in one request.
     *
     * @param showSpinner - Whether to show loading spinner
     * @param spinnerTime - Duration to show spinner in milliseconds
     */
    const fetchBoxTypesProps = useCallback((showSpinner: boolean = true, spinnerTime: number = 2000) => {

        if(showSpinner){
            setShowSpinner(true);
        }
        // Request all box types with high per_page value to avoid multiple requests
        api.get('/get-box-types?per_page=100').then((res) => {
            // Extract data array from paginated response
            setBoxTypesProps(res.data.data || []);
            setTimeout(() => {
                if(showSpinner){
                    setShowSpinner(false);
                }
            }, spinnerTime);
        }).catch((error) => {
            setShowSpinner(false);
            showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.log(error);
        });
    }, [setShowSpinner, showToast, t]);

    /**
     * Fetches all categories with slices count using pagination support.
     * Uses a high per_page value to get all items in one request.
     *
     * @param showSpinner - Whether to show loading spinner
     * @param spinnerTime - Duration to show spinner in milliseconds
     */
    const fetchCategoriesProps = useCallback((showSpinner: boolean = true, spinnerTime: number = 2000) => {

        if(showSpinner){
            setShowSpinner(true);
        }
        // Request all categories with high per_page value to avoid multiple requests
        api.get('/get-categories-with-slices-count?per_page=100').then((res) => {
            // Extract data array from paginated response
            setCategoriesProps(res.data.data || []);
            setTimeout(() => {
                if(showSpinner){
                    setShowSpinner(false);
                }
            }, spinnerTime);
        }).catch((error) => {
            setShowSpinner(false);
            showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.log(error);
        });
    }, [setShowSpinner, showToast, t]);

    /**
     * Fetches all localities with full info using pagination support.
     * Uses a high per_page value to get all items in one request.
     *
     * @param showSpinner - Whether to show loading spinner
     * @param spinnerTime - Duration to show spinner in milliseconds
     */
    const fetchLocalities = useCallback((showSpinner: boolean = true, spinnerTime: number = 2000) => {

        if(showSpinner){
            setShowSpinner(true);
        }
        // Request all localities with high per_page value to avoid multiple requests
        api.get('/get-localites-with-full-info?per_page=500').then((res) => {
            // Handle both paginated and non-paginated response formats
            const localitiesData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setLocalities(localitiesData);
            setTimeout(() => {
                if(showSpinner){
                    setShowSpinner(false);
                }
            }, spinnerTime);
        }).catch((error) => {
            setShowSpinner(false);
            showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.log(error);
        });
    }, [setShowSpinner, showToast, t]);

    /**
     * Fetches all slices/products using pagination support.
     * Uses a high per_page value to get all items in one request.
     *
     * @param showSpinner - Whether to show loading spinner
     * @param spinnerTime - Duration to show spinner in milliseconds
     */
    const fetchSlicesProps = useCallback((showSpinner: boolean = true, spinnerTime: number = 2000) => {

        if(showSpinner){
            setShowSpinner(true);
        }
        // Request all slices with high per_page value to avoid multiple requests
        api.get('/get-slices?per_page=200').then((res) => {
            // Extract data array from paginated response
            setSlicesProps(res.data.data || []);
            setTimeout(() => {
                if(showSpinner){
                    setShowSpinner(false);
                }
            }, spinnerTime);
        }).catch((error) => {
            setShowSpinner(false);
            showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.log(error);
        });
    }, [setShowSpinner, showToast, t]);

    /**
     * 
     */
    const fetchData = useCallback(() => {
        fetchBoxTypesProps(false);
        fetchCategoriesProps(false);
        fetchSlicesProps(false);
        fetchLocalities(true, 2000);
    }, [fetchBoxTypesProps, fetchCategoriesProps, fetchLocalities, fetchSlicesProps]);

    /**
     * 
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Define the context value
     * Memoize to prevent unnecessary re-renders of all consumers
     */
    const contextValue : DataContextType = useMemo(() => ({
        boxTypesProps,
        categoriesProps,
        localities,
        slicesProps,
        fetchBoxTypesProps,
        fetchCategoriesProps,
        fetchData,
        fetchLocalities,
        fetchSlicesProps,
        setBoxTypesProps,
        setCategoriesProps,
        setLocalities,
        setSlicesProps
    }), [
        boxTypesProps,
        categoriesProps,
        localities,
        slicesProps,
        fetchBoxTypesProps,
        fetchCategoriesProps,
        fetchData,
        fetchLocalities,
        fetchSlicesProps,
        setBoxTypesProps,
        setCategoriesProps,
        setLocalities,
        setSlicesProps
    ]);
    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default DataProvider;
