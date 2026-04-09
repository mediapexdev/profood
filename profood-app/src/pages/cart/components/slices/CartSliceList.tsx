import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import CartSlice, { CartSliceProps } from './CartSlice';
import EmptyCart from '../others/EmptyCart';
import { useCartContext } from '../contexts/CartProvider';

import './CartSliceList.css';

/**
 * 
 */
export interface CartSlicePropsList {
    cartSlicePropsList: CartSliceProps[];
}

/**
 * 
 * @returns 
 */
const CartSliceList: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { slices, totalSlices } = useCartContext();

    if(totalSlices < 1){

        return (
            <EmptyCart
                text={`${t("Aucun produit pour le moment. N'attendez pas pour vous régaler")} !`}
                redirectedUrl='/slices/category/1'
            />
        );
    }
    return (
        <IonGrid className="slice-list-widget cart-slice-list-widget pt-0">
            <IonRow>
            {
                slices?.map((slice_props) => (
                    <IonCol
                        size="12" size-sm="6" size-md='4' size-lg='4' size-xl='3'
                        key={slice_props.id}
                    >
                        <CartSlice {...slice_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default CartSliceList;
