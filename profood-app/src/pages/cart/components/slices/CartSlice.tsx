import React from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonLabel,
    useIonAlert 
} from "@ionic/react";

import { trash } from "ionicons/icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import { SliceProps } from "../../../../components/slices/Slice";
import { useCartContext } from "../contexts/CartProvider";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";
import useToast from "../../../../components/hooks/useToast";
import { formatNumber } from "../../../../helpers/AssetHelpers";

import './CartSlice.css';

/**
 * 
 */
export interface CartSliceProps {
    id: number;
    quantity: number;
    cart_id: number;
    slice: SliceProps;
}

/**
 * 
 * @param slice_props 
 * @returns 
 */
const CartSlice : React.FC<CartSliceProps> = (slice_props: CartSliceProps) => {
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
    const { deleteSlice } = useCartContext();

    /**
     * 
     */
    const {logged, userId} = useUserInfosContext();

    /**
     * 
     */
    const deleteSliceFromCart = () => {

        const token = localStorage.getItem('token');

        if(token !== null && logged){

            const data = {
                slice_id : slice_props.slice.id,
                customer_id: userId
            };
            api.post('/delete-slice-from-cart', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => {
                if(res.status === 200){
                    deleteSlice(slice_props.id);
                    showToast(`${t('Produit supprimé du panier')} !`);
                }
                else{
                    showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                }
            })
            .catch((error) => {
                showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                console.log(error);
            });
        }
        else{
            showToast(`${t('Veuillez vous connecter pour supprimer le produit du panier')}.`);
        }
    };

    /**
     * 
     */
    const [showAlert] = useIonAlert();

    return (
        <IonCard className="slice-widget cart-slice-widget card translucent-style">
            <div className="slice-image-wrapper">
                <img
                    className="slice-image img-fluid"
                    src={slice_props.slice.illustration}
                    alt={t(slice_props.slice.wording)}
                />
            </div>
            <IonCardContent className="slice-widget-content cart-slice-widget-content card-body">
                <div className="slice-infos">
                    <div className="slice-title-wrapper">
                        <IonCardTitle className="slice-title card-title title-color font-md">{t(slice_props.slice.wording)}</IonCardTitle>
                    </div>
                    <div className="d-flex flex-stack mb-3">
                        {/* <div className="slice-weight-wrapper">
                            <IonCardSubtitle className="slice-weight content-color font-sm">
                                <span>{formatNumber(cart_slice_props.slice.weight)}</span>
                                <span>kg</span>
                            </IonCardSubtitle>
                        </div> */}
                        <div className="slice-price-wrapper">
                            <IonCardSubtitle className="slice-price title-color font-sm">
                                <span>{formatNumber(slice_props.slice.price)}</span>
                                <small className="ms-1">Fcfa</small>
                            </IonCardSubtitle>
                        </div>
                    </div>
                </div>
                <div className="slice-widget-buttons-wrapper cart-slice-widget-buttons-wrapper">
                    <IonLabel className="box-quantity">{slice_props.quantity}</IonLabel>
                    <IonButton
                        type='button'
                        buttonType='button'
                        size="small"
                        className="btn-remove"
                        onClick={() =>
                            showAlert({
                                cssClass: 'product-removal-alert',
                                header: t("Avertissement"),
                                message: `${t("Vous êtes sur le point de supprimer ce produit de la commande")} ?`,
                                buttons: [
                                    {
                                        text: t('Annuler'),
                                        role: 'cancel',
                                        cssClass : 'alert-btn-cancel',
                                    },
                                    {
                                        text: t('Supprimer'),
                                        role: 'confirm',
                                        cssClass : 'alert-btn-confirm',
                                        handler: () => {
                                            deleteSliceFromCart();
                                        },
                                    }
                                ]
                            })
                        }
                    >
                        <IonIcon icon={trash}></IonIcon>
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default CartSlice;
