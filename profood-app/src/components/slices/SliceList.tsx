import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import Slice, { SliceProps } from './Slice';

import './SliceList.css';

/**
 * 
 */
export interface SlicePropsList {
    slicePropsList: SliceProps[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const SliceList: React.FC<SlicePropsList> = ({slicePropsList}: SlicePropsList) => {

    return (
        <IonGrid className="slice-list-widget">
            <IonRow>
            {
                slicePropsList.map((slice_props) => (
                    <IonCol
                        size="12" size-sm="6" size-md="4" size-lg='3'
                        key={slice_props.id}
                    >
                        <Slice {...slice_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default SliceList;
