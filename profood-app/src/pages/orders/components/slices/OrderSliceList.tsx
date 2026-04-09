import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import NoOrderProduct from '../NoOrderProduct';
import OrderSlice, { OrderSliceProps } from './OrderSlice';

import './OrderSliceList.css';

/**
 * 
 */
export interface OrderSliceListProp {
    slices: OrderSliceProps[];
}

/**
 * 
 * @param prop 
 * @returns 
 */
const OrderSliceList: React.FC<OrderSliceListProp> = (prop : OrderSliceListProp) => {
    /**
     * 
     */
    const { t } = useTranslation();

    if(!prop.slices.length){
        return (
            <NoOrderProduct text={`${t('Aucun produit au détail pour cette commande')}.`} />
        );
    }
    return (
        <IonGrid className="slice-list-widget order-slice-list-widget pt-0">
            <IonRow>
            {
                prop.slices?.map((slice_props) => (
                    <IonCol
                        size="12" size-sm="6" size-md='4' size-lg='4' size-xl='3'
                        key={slice_props.id}
                    >
                        <OrderSlice {...slice_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default OrderSliceList;
