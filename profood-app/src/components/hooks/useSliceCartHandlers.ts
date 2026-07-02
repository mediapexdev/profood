import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import api from '../../api/api';
import { SliceProps } from '../slices/Slice';
import useToast from './useToast';
import { useCategoryContext } from '../../contexts/CategoryProvider';
import { useUserInfosContext } from '../../contexts/UserInfosProvider';
import { useCartContext } from '../../pages/cart/components/contexts/CartProvider';
import {
    addSliceToGuestCart,
    getGuestCart,
    GUEST_CART_CHANGED_EVENT,
    removeSliceFromGuestCart,
    saveGuestCart,
} from '../../services/GuestCartService';

/**
 * Builds the slice_id -> quantity map from the persisted guest cart.
 */
const readGuestQuantities = (): Map<number, number> => {
    const cart = getGuestCart();
    const map = new Map<number, number>();
    cart.slices.forEach((s) => map.set(s.slice_id, s.quantity));
    return map;
};

/**
 * Dual-mode slice quantity handlers shared by every slice stepper UI
 * (home PopularSlices carousel, CategoriesPage grid, ...).
 *
 * Logged-in users accumulate a selection (CategoryProvider) that is
 * submitted to the server cart through `addToCart` — the same
 * `/add-slices-to-cart` flow as the category page header menu.
 *
 * Guests bypass the selection entirely: each tap goes straight to the
 * localStorage guest cart so they can order without an account, and the
 * cart page picks the items up through CartProvider's guest branch.
 *
 * Must be called under a <CategoryProvider>.
 *
 * @param slices catalogue used to resolve a tapped id to a full SliceProps
 */
const useSliceCartHandlers = (slices: SliceProps[]) => {
    const { t } = useTranslation();
    const showToast = useToast();

    /**
     * Selection state used by the LOGGED flow.
     */
    const { slices: selection, totalNumber, add, remove, clear, getQuantity } = useCategoryContext();

    const { updateSlices, fetchData } = useCartContext();
    const { logged, userId } = useUserInfosContext();

    /**
     * Guest quantities mirror — seeded from the persisted guest cart and
     * re-synced on every guest-cart mutation, wherever it happens: Ionic
     * keeps several pages mounted at once (home carousel, categories,
     * cart), so deletes on the cart page or a checkout clearing the cart
     * must reach every mounted instance of this hook.
     */
    const [guestQuantities, setGuestQuantities] = useState<Map<number, number>>(readGuestQuantities);

    useEffect(() => {
        const resync = () => setGuestQuantities(readGuestQuantities());

        window.addEventListener(GUEST_CART_CHANGED_EVENT, resync);
        return () => window.removeEventListener(GUEST_CART_CHANGED_EVENT, resync);
    }, []);

    /** Total number of individual cuts in the guest cart (for the bar) */
    const guestTotal = Array.from(guestQuantities.values()).reduce((sum, q) => sum + q, 0);

    /**
     * GUEST flow: adding goes straight into the localStorage cart —
     * no account required to order.  The storage write fires the
     * guest-cart-changed event, which re-syncs guestQuantities.
     */
    const guestAdd = useCallback((id: number) => {
        const slice = slices.find((s) => s.id === id);

        if (slice) {
            addSliceToGuestCart(slice, 1);
            fetchData();
            showToast(`${t(slice.wording)} ${t('ajouté au panier')}`);
        }
    }, [fetchData, showToast, slices, t]);

    const guestRemove = useCallback((id: number) => {
        // Operate on the PERSISTED quantity — the React mirror could lag —
        // and never leave a quantity <= 0 entry in the stored cart.
        const cart = getGuestCart();
        const existing = cart.slices.find((s) => s.slice_id === id);

        if (!existing) {
            return;
        }

        if (existing.quantity <= 1) {
            removeSliceFromGuestCart(id);
        }
        else {
            existing.quantity -= 1;
            saveGuestCart(cart);
        }
        fetchData();
    }, [fetchData]);

    /** Effective handlers: guests write to the guest cart, logged users
        build a selection submitted via the "Ajouter au panier" bar. */
    const handleAdd = useCallback((id: number) => {
        if (logged) {
            add({ id, quantity: 1 });
        }
        else {
            guestAdd(id);
        }
    }, [add, guestAdd, logged]);

    const handleRemove = useCallback((id: number) => {
        if (logged) {
            remove(id);
        }
        else {
            guestRemove(id);
        }
    }, [guestRemove, logged, remove]);

    const displayedQuantity = useCallback((id: number) => (
        logged ? getQuantity(id) : (guestQuantities.get(id) || 0)
    ), [getQuantity, guestQuantities, logged]);

    const resetSelection = useCallback(() => {
        clear();
        showToast(`${t('Sélection réinitialisée')} !`);
    }, [clear, showToast, t]);

    /**
     * Shared error handler: a 401 means the stored token is missing or
     * expired — tell the user to sign in instead of surfacing the API's
     * raw "Unauthenticated." message.
     */
    const showRequestError = useCallback((error: any) => {
        if (error?.response?.status === 401) {
            showToast(`${t('Veuillez vous connecter pour ajouter au panier')}.`);
        }
        else {
            showToast(error?.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
        }
        console.log(error);
    }, [showToast, t]);

    /**
     * LOGGED flow: submit the selection to the server cart — same flow
     * as the category page header menu.
     */
    const addToCart = useCallback(() => {
        if (totalNumber < 1) {
            showToast(`${t("Vous n'avez encore rien choisi")} !`);
            return;
        }

        const data = {
            customer_id: userId,
            slices: selection,
        };
        const token = localStorage.getItem('token');

        if (token !== null && logged) {
            const myHeaders = { Authorization: `Bearer ${token}` };

            api.post('/add-slices-to-cart', data, { headers: myHeaders })
                .then((res) => {
                    if (res.status === 200) {
                        showToast(t(res.data.message));
                        clear();

                        api.get('/get-cart-slices', { headers: myHeaders })
                            .then((res2) => {
                                if (res2.status === 200) {
                                    updateSlices(res2.data);
                                }
                                else {
                                    showToast(res2.data.message ? t(res2.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                                }
                            })
                            .catch(showRequestError);
                    }
                    else {
                        showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                    }
                })
                .catch(showRequestError);
        }
        else {
            showToast(`${t('Veuillez vous connecter pour ajouter au panier')}.`);
        }
    }, [clear, logged, selection, showRequestError, showToast, t, totalNumber, updateSlices, userId]);

    return {
        logged,
        totalNumber,
        guestTotal,
        handleAdd,
        handleRemove,
        displayedQuantity,
        addToCart,
        resetSelection,
    };
};

export default useSliceCartHandlers;
