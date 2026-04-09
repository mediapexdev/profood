import React from "react";

import { 
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonIcon,
    IonItem,
    useIonAlert
} from "@ionic/react";

import { trash } from "ionicons/icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import BoxDetails from "../../../../components/box/BoxDetails";
import BoxSliceList from "../../../../components/box/slices/BoxSliceList";
import EmptyCart from "../others/EmptyCart";
import { useCartContext } from "../contexts/CartProvider";
import { useUserInfosContext } from "../../../../contexts/UserInfosProvider";
import useToast from "../../../../components/hooks/useToast";

import './CartBoxList.css'

/**
 * 
 * @returns 
 */
const CartBoxList: React.FC = () => {
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
    const { boxes, deleteBox } = useCartContext();

    /**
     * 
     */
    const {logged, userId} = useUserInfosContext();

    /**
     * 
     * @param box_id 
     */
    const deleteBoxFromCart = (box_id: number) => {

        const token = localStorage.getItem('token');

        if(token !== null && logged){

            const data = {
                id: box_id,
                customer_id: userId
            };
            api.post('/delete-box-from-cart', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => {
                if(res.status === 200){
                    deleteBox(box_id);
                    showToast(`${t('Box supprimé du panier')} !`);
                }
                else{
                    showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                }
            }).catch((error) => {
                showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                console.log(error);
            });
        }
        else{
            showToast(`${t('Veuillez vous connecter pour supprimer le box du panier')}.`);
            // router.push("/signin", "forward", "push");
        }
    };

    /**
     * 
     */
    const [showAlert] = useIonAlert();

    if(!boxes.length) {
        return (
            <EmptyCart
                text={`${t("Aucun Box pour le moment. N'attendez pas pour vous régaler")} !`}
                redirectedUrl="/views/home"
            />
        );
    }
    return(
        <IonAccordionGroup className="boxes-list cart-boxes-list">
            <div className="boxes-list-wrapper">
            {
                boxes?.map((box_props) => (
                    <IonAccordion
                        value={`${box_props.id}`}
                        key={box_props.id}
                    >
                        <IonItem
                            slot="header"
                            className="translucent-style"
                            lines="full"
                        >
                            <BoxDetails {...box_props} />
                        </IonItem>
                        <div slot="content">
                            <div className="btn-remove-box-wrapper d-flex flex-row flex-wrap align-items-center justify-content-end">
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    size="default"
                                    className="btn-remove-box"
                                    onClick={() =>
                                        showAlert({
                                            cssClass: 'box-removal-alert',
                                            header: t("Avertissement"),
                                            message: `${t('Vous êtes sur le point de supprimer ce produit de la commande')} ?`,
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
                                                        deleteBoxFromCart(box_props.id)
                                                    },
                                                }
                                            ]
                                        })
                                    }
                                >
                                    <IonIcon icon={trash}></IonIcon>
                                </IonButton>
                            </div>
                            <BoxSliceList boxSlicePropsList={box_props.box_slices}/>
                        </div>
                    </IonAccordion>
                ))
            }
            </div>
        </IonAccordionGroup>
    );
}

export default CartBoxList;
