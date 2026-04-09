import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import BoxType, {BoxTypeProps } from "./BoxType";

/**
 * 
 */
export interface BoxTypePropsList {
    boxTypePropsList: BoxTypeProps[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxTypeList: React.FC<BoxTypePropsList> = ({boxTypePropsList}: BoxTypePropsList) => {

    return (
        <IonGrid className="box-type-list-widget">
            <IonRow>
            {
                boxTypePropsList.map((box_type_props) => (
                    <IonCol
                        size="12" size-sm="6" size-md="4" size-lg='3'
                        key={box_type_props.id}
                    >
                        <BoxType {...box_type_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default BoxTypeList;
