import React, { useCallback, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import { BoxProps } from "../../../../components/box/BoxDetails";
import { getGuestCart } from "../../../../services/GuestCartService";
import { CartSliceProps } from "../slices/CartSlice";
import CartContext, { CartContextType } from "./CartContext";
import { useLoadingSpinnerContext } from "../../../../contexts/LoadingSpinnerProvider";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";

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
export const useCartContext = () => useContext(CartContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const CartProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [boxes, setBoxes] = useState<BoxProps[]>([]);

    /**
     * 
     */
    const [slices, setSlices] = useState<CartSliceProps[]>([]);

    /**
     * 
     */
    const [totalBoxes, setTotalBoxes] = useState<number>(0);

    /**
     * 
     */
    const [totalSlices, setTotalSlices] = useState<number>(0);

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
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    // const { logged } = useUserInfosContext();

    /**
     * 
     * @param newBoxes 
     */
    const calculateBoxesAmount = useCallback((newBoxes: BoxProps[]) => {
        let montant = 0;

        if(newBoxes.length){
            newBoxes.forEach((box) => {
                montant += Number(box.type.price);
            });
        }
        setTotalBoxes(montant);
    }, []);

    /**
     * 
     * @param newSlices 
     */
    const calculateSlicesAmount = useCallback((newSlices: CartSliceProps[]) => {
        let montant = 0;

        if(newSlices.length){
            newSlices.forEach((slice) => {
                montant += Number(slice.slice.price*slice.quantity);
            });
        }
        setTotalSlices(montant);
    }, []);

    /**
     * 
     * @param itemId 
     */
    const deleteBox = useCallback((itemId: number) => {
        // Check if the item is already in the cart
        const newBoxes = boxes.filter((box) => box.id !== itemId);
        setBoxes(newBoxes);
        calculateBoxesAmount(newBoxes);
    }, [boxes, calculateBoxesAmount]);

    /**
     * 
     * @param itemId 
     */
    const deleteSlice = useCallback((itemId: number) => {
        // Recompute totals from the post-delete array — passing the stale
        // `slices` captured by the closure would keep the removed item in
        // the order summary amounts.
        const newSlices = slices.filter((slice) => slice.id !== itemId);
        setSlices(newSlices);
        calculateSlicesAmount(newSlices);
    }, [calculateSlicesAmount, slices]);

    /**
     * Define the function to add an item to the cart
     *
     * @param itemToAdd 
     */
    const updateBoxes = useCallback((items: BoxProps[]) => {
        setBoxes(items);
        calculateBoxesAmount(items);
    }, [calculateBoxesAmount]);

    /**
     * Define the function to add an item to the cart
     *
     * @param itemToAdd 
     */
    const updateSlices = useCallback((items: CartSliceProps[]) => {
        // Check if the item is already in the cart
        setSlices(items);
        calculateSlicesAmount(items);
    }, [calculateSlicesAmount]);

    /**
     * 
     */
    const { userId } = useUserInfosContext();

    /**
     * 
     */
    const fetchData = useCallback(() => {

        setShowSpinner(true);
        const token = localStorage.getItem('token');

        if(token !== null && userId > 0){

            api.get('/get-cart-boxes', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res1) => {
                if(res1.status === 200 || res1.status === 204){

                    // updateBoxes(res1.status === 200 ? res1.data : []);

                    api.get('/get-cart-slices', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then((res2) => {
                        if(res2.status === 200 || res2.status === 204){
                            updateBoxes(res1.status === 200 ? res1.data : []);
                            updateSlices(res2.status === 200 ? res2.data : []);
                            setShowSpinner(false);
                            // console.log(res1.data)
                            // console.log(res2.data)
                        }
                        else{
                            setShowSpinner(false);
                            showToast(res2.data.message ? t(res2.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                        }
                    })
                    .catch((error) => {
                        setShowSpinner(false);
                        // 401 = the stored session is no longer valid; the api
                        // client purges it and the app returns to logged-out —
                        // an empty cart is the correct state, not an error.
                        if(error?.response?.status !== 401){
                            showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                        }
                        // console.log(error);
                    });
                }
                else{
                    setShowSpinner(false);
                    showToast(res1.data.message ? t(res1.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                }
            })
            .catch((error) => {
                setShowSpinner(false);
                // 401 handled globally (session purge) — stay silent on load.
                if(error?.response?.status !== 401){
                    showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                }
                // console.log(error);
            });
        }
        else{
            // No valid session: the cart lives in localStorage (guest cart).
            // Surface it through the same context so the cart page, totals
            // and checkout flow work for unauthenticated users too.
            const guestCart = getGuestCart();

            const guestSlices: CartSliceProps[] = guestCart.slices.map((s) => ({
                id: s.slice_id,
                quantity: s.quantity,
                cart_id: 0,
                slice: s.slice
            }));

            const guestBoxes: BoxProps[] = guestCart.boxes.map((b, index) => ({
                id: index,
                cart_id: 0,
                type: b.box_type,
                box_slices: b.slices.map((bs, i) => ({
                    id: i,
                    box_id: index,
                    quantity: bs.quantity,
                    slice: bs.slice
                }))
            }));

            updateBoxes(guestBoxes);
            updateSlices(guestSlices);
            setShowSpinner(false);
        }
    }, [setShowSpinner, showToast, t, updateBoxes, updateSlices, userId]);

    /**
     * 
     */
	useEffect(() => {
        fetchData();
	}, [fetchData]);

    /**
     * Define the context value
     */
    const contextValue : CartContextType = {
        boxes,
        slices,
        totalBoxes,
        totalSlices,
        deleteBox,
        deleteSlice,
        fetchData,
        updateBoxes,
        updateSlices
    };
    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export default CartProvider;
