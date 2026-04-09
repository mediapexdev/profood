import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import BoxSlice, { BoxSliceProps } from './BoxSlice';

import './BoxSliceList.css';

/**
 * 
 */
export interface BoxSlicePropsList {
    boxSlicePropsList: BoxSliceProps[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxSliceList: React.FC<BoxSlicePropsList> = ({boxSlicePropsList}: BoxSlicePropsList) => {

    return (
        <IonGrid className="slice-list-widget box-slice-list-widget">
            <IonRow>
            {
                boxSlicePropsList.map((box_slice_props) => (
                    <IonCol
                        size="12" size-sm="6" size-md='4' size-lg='4' size-xl='3'
                        key={box_slice_props.id}
                    >
                        <BoxSlice {...box_slice_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default BoxSliceList;
