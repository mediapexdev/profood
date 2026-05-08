import React, { useCallback, useState } from 'react';

import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonLabel,
    useIonAlert,
} from '@ionic/react';

import { addOutline, removeOutline, trash } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import api from '../../../api/api';
import BoxDetails from '../../../components/box/BoxDetails';
import BoxSliceList from '../../../components/box/slices/BoxSliceList';
import { formatNumber, toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';
import useGoTo from '../../../components/hooks/useGoTo';
import useToast from '../../../components/hooks/useToast';
import { useCartContext } from './contexts/CartProvider';
import { useUserInfosContext } from '../../../contexts/UserInfosProvider';
import { CartSliceProps } from './slices/CartSlice';

/**
 * CartItemList — unified list of everything in the cart.
 *
 * Renders two sections:
 *   1. Boxes  — each displayed as an accordion header (BoxDetails) that
 *      expands to reveal its constituent slices (BoxSliceList).
 *   2. Découpes (individual slices) — cards with quantity +/- controls and a
 *      per-line total price.
 *
 * Empty state:
 *   When both boxes and slices are absent the component shows a full-page
 *   empty-cart illustration with a CTA to browse products.
 *
 * Quantity controls for slices:
 *   Optimistic UI update — CartContext is mutated immediately so the UI feels
 *   instant on mobile.  If the server call fails, fetchData() re-syncs the
 *   real state.  Minimum quantity is 1; tapping minus at qty=1 triggers the
 *   remove-confirmation alert.
 *
 * Remove confirmation:
 *   Both boxes and slices show an IonAlert before deletion to protect against
 *   accidental taps.
 */
const CartItemList: React.FC = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const goTo = useGoTo();
    const [showAlert] = useIonAlert();

    const { boxes, slices, deleteBox, deleteSlice, updateSlices, fetchData } = useCartContext();
    const { logged, userId } = useUserInfosContext();

    /**
     * Tracks which cart-slice IDs have a pending API call in flight.
     * Buttons are disabled for those IDs to prevent double-taps.
     */
    const [pendingSliceIds, setPendingSliceIds] = useState<Set<number>>(new Set());

    const isEmpty = boxes.length === 0 && slices.length === 0;

    // ── Delete box ─────────────────────────────────────────────────────────────

    const handleDeleteBox = useCallback(
        (boxId: number) => {
            const token = localStorage.getItem('token');
            if (!token || !logged) {
                showToast(`${t('Veuillez vous connecter pour supprimer le box du panier')}.`);
                return;
            }
            api
                .post(
                    '/delete-box-from-cart',
                    { id: boxId, customer_id: userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((res) => {
                    if (res.status === 200) {
                        deleteBox(boxId);
                        showToast(`${t('Box supprimé du panier')} !`);
                    } else {
                        showToast(
                            res.data?.message
                                ? t(res.data.message)
                                : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`
                        );
                    }
                })
                .catch(() => {
                    showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                });
        },
        [logged, userId, deleteBox, showToast, t]
    );

    // ── Delete slice ───────────────────────────────────────────────────────────

    const handleDeleteSlice = useCallback(
        (cartSliceId: number, sliceId: number) => {
            const token = localStorage.getItem('token');
            if (!token || !logged) {
                showToast(`${t('Veuillez vous connecter pour supprimer le produit du panier')}.`);
                return;
            }
            api
                .post(
                    '/delete-slice-from-cart',
                    { slice_id: sliceId, customer_id: userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((res) => {
                    if (res.status === 200) {
                        deleteSlice(cartSliceId);
                        showToast(`${t('Produit supprimé du panier')} !`);
                    } else {
                        showToast(
                            res.data?.message
                                ? t(res.data.message)
                                : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`
                        );
                    }
                })
                .catch(() => {
                    showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                });
        },
        [logged, userId, deleteSlice, showToast, t]
    );

    // ── Quantity change for individual slices ──────────────────────────────────

    /**
     * Adjust the quantity of a cart slice by `delta` (+1 or -1).
     *
     * When `delta` is -1 and the current quantity is already 1, treat this as a
     * remove action and show the confirmation alert rather than a decrement.
     */
    const handleQuantityChange = useCallback(
        (cartSlice: CartSliceProps, delta: 1 | -1) => {
            if (delta === -1 && cartSlice.quantity <= 1) {
                showAlert({
                    cssClass: 'product-removal-alert',
                    header: t('Avertissement'),
                    message: `${t('Vous êtes sur le point de supprimer ce produit de la commande')} ?`,
                    buttons: [
                        { text: t('Annuler'), role: 'cancel', cssClass: 'alert-btn-cancel' },
                        {
                            text: t('Supprimer'),
                            role: 'confirm',
                            cssClass: 'alert-btn-confirm',
                            handler: () => handleDeleteSlice(cartSlice.id, cartSlice.slice.id),
                        },
                    ],
                });
                return;
            }

            const token = localStorage.getItem('token');
            if (!token || !logged) {
                showToast(`${t('Veuillez vous connecter pour modifier le panier')}.`);
                return;
            }

            // Optimistic update — mutate the context immediately for instant mobile feedback
            const newSlices = slices.map((s) =>
                s.id === cartSlice.id ? { ...s, quantity: s.quantity + delta } : s
            );
            updateSlices(newSlices);

            setPendingSliceIds((prev) => new Set(prev).add(cartSlice.id));

            /*
             * These endpoints are expected to exist on the API.
             * If they are not yet implemented the component gracefully rolls back
             * the optimistic update via fetchData().
             */
            const endpoint = delta === 1 ? '/increment-cart-slice' : '/decrement-cart-slice';

            api
                .post(
                    endpoint,
                    { cart_slice_id: cartSlice.id, customer_id: userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((res) => {
                    if (res.status !== 200) {
                        fetchData();
                        showToast(
                            res.data?.message
                                ? t(res.data.message)
                                : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`
                        );
                    }
                })
                .catch(() => {
                    fetchData();
                    showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                })
                .finally(() => {
                    setPendingSliceIds((prev) => {
                        const next = new Set(prev);
                        next.delete(cartSlice.id);
                        return next;
                    });
                });
        },
        [logged, userId, slices, updateSlices, fetchData, handleDeleteSlice, showAlert, showToast, t]
    );

    // ── Empty state ────────────────────────────────────────────────────────────

    if (isEmpty) {
        return (
            <div className="empty-cart ion-padding">
                <div className="d-flex flex-column flex-center">
                    <div className="image-wrapper my-5">
                        <img
                            src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                            alt={t('Votre panier est vide')}
                        />
                    </div>
                    <div className="d-flex flex-column flex-center">
                        <p className="empty-cart-text text-center mb-3">
                            {`${t('Votre panier est vide pour le moment')}.`}
                        </p>
                        <IonButton
                            type="button"
                            buttonType="button"
                            fill="solid"
                            size="default"
                            className="text-transform-none"
                            onClick={() => goTo('/views/home')}
                        >
                            <span>{t('Acheter')}</span>
                        </IonButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-item-list">
            {/* ── Section 1: Boxes ────────────────────────────────────────────── */}
            {boxes.length > 0 && (
                <div className="cart-section cart-boxes-section">
                    <IonAccordionGroup className="boxes-list cart-boxes-list">
                        <div className="boxes-list-wrapper">
                            {boxes.map((box) => (
                                <IonAccordion value={`${box.id}`} key={box.id}>
                                    {/* Header — shows box name, capacity, price */}
                                    <IonItem
                                        slot="header"
                                        className="translucent-style"
                                        lines="full"
                                    >
                                        <BoxDetails {...box} />
                                    </IonItem>

                                    {/* Body — slice list + remove button */}
                                    <div slot="content">
                                        <div className="btn-remove-box-wrapper d-flex flex-row flex-wrap align-items-center justify-content-end">
                                            <IonButton
                                                type="button"
                                                buttonType="button"
                                                size="default"
                                                className="btn-remove-box"
                                                onClick={() =>
                                                    showAlert({
                                                        cssClass: 'box-removal-alert',
                                                        header: t('Avertissement'),
                                                        message: `${t('Vous êtes sur le point de supprimer ce produit de la commande')} ?`,
                                                        buttons: [
                                                            {
                                                                text: t('Annuler'),
                                                                role: 'cancel',
                                                                cssClass: 'alert-btn-cancel',
                                                            },
                                                            {
                                                                text: t('Supprimer'),
                                                                role: 'confirm',
                                                                cssClass: 'alert-btn-confirm',
                                                                handler: () => handleDeleteBox(box.id),
                                                            },
                                                        ],
                                                    })
                                                }
                                            >
                                                <IonIcon icon={trash} />
                                            </IonButton>
                                        </div>
                                        <BoxSliceList boxSlicePropsList={box.box_slices} />
                                    </div>
                                </IonAccordion>
                            ))}
                        </div>
                    </IonAccordionGroup>
                </div>
            )}

            {/* ── Section 2: Individual slices ────────────────────────────────── */}
            {slices.length > 0 && (
                <div className="cart-section cart-slices-section">
                    {slices.map((cartSlice) => {
                        const lineTotal = cartSlice.slice.price * cartSlice.quantity;
                        const isPending = pendingSliceIds.has(cartSlice.id);

                        return (
                            <IonCard
                                key={cartSlice.id}
                                className="slice-widget cart-slice-widget card translucent-style"
                            >
                                {/* Product thumbnail */}
                                <div className="slice-image-wrapper">
                                    <img
                                        className="slice-image img-fluid"
                                        src={cartSlice.slice.illustration}
                                        alt={t(cartSlice.slice.wording)}
                                    />
                                </div>

                                <IonCardContent className="slice-widget-content cart-slice-widget-content card-body">
                                    <div className="slice-infos">
                                        {/* Product name */}
                                        <div className="slice-title-wrapper">
                                            <IonCardTitle className="slice-title card-title title-color font-md">
                                                {t(cartSlice.slice.wording)}
                                            </IonCardTitle>
                                        </div>

                                        {/* Unit price */}
                                        <div className="d-flex flex-stack mb-2">
                                            <div className="slice-price-wrapper">
                                                <IonCardSubtitle className="slice-price title-color font-sm">
                                                    <span>{formatNumber(cartSlice.slice.price)}</span>
                                                    <small className="ms-1">Fcfa</small>
                                                </IonCardSubtitle>
                                            </div>
                                        </div>

                                        {/* Line total — only shown when qty > 1 to reduce visual noise */}
                                        {cartSlice.quantity > 1 && (
                                            <div className="slice-line-total content-color font-xs">
                                                <span>{formatNumber(lineTotal)}</span>
                                                <small className="ms-1">Fcfa</small>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity controls + remove */}
                                    <div className="slice-widget-buttons-wrapper cart-slice-widget-buttons-wrapper">
                                        <IonButton
                                            type="button"
                                            buttonType="button"
                                            size="small"
                                            fill="clear"
                                            className="btn-quantity btn-quantity-minus"
                                            disabled={isPending}
                                            aria-label={`${t('Quantité')} -`}
                                            onClick={() => handleQuantityChange(cartSlice, -1)}
                                        >
                                            <IonIcon icon={removeOutline} />
                                        </IonButton>

                                        <IonLabel className="box-quantity">
                                            {cartSlice.quantity}
                                        </IonLabel>

                                        <IonButton
                                            type="button"
                                            buttonType="button"
                                            size="small"
                                            fill="clear"
                                            className="btn-quantity btn-quantity-plus"
                                            disabled={isPending}
                                            aria-label={`${t('Quantité')} +`}
                                            onClick={() => handleQuantityChange(cartSlice, 1)}
                                        >
                                            <IonIcon icon={addOutline} />
                                        </IonButton>

                                        <IonButton
                                            type="button"
                                            buttonType="button"
                                            size="small"
                                            className="btn-remove"
                                            disabled={isPending}
                                            aria-label={t('Supprimer')}
                                            onClick={() =>
                                                showAlert({
                                                    cssClass: 'product-removal-alert',
                                                    header: t('Avertissement'),
                                                    message: `${t('Vous êtes sur le point de supprimer ce produit de la commande')} ?`,
                                                    buttons: [
                                                        {
                                                            text: t('Annuler'),
                                                            role: 'cancel',
                                                            cssClass: 'alert-btn-cancel',
                                                        },
                                                        {
                                                            text: t('Supprimer'),
                                                            role: 'confirm',
                                                            cssClass: 'alert-btn-confirm',
                                                            handler: () =>
                                                                handleDeleteSlice(cartSlice.id, cartSlice.slice.id),
                                                        },
                                                    ],
                                                })
                                            }
                                        >
                                            <IonIcon icon={trash} />
                                        </IonButton>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CartItemList;
