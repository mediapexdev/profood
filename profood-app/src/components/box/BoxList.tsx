import React from "react";

import { IonAccordion, IonAccordionGroup, IonItem} from "@ionic/react";

import BoxDetails, { BoxProps } from "./BoxDetails";
import BoxSliceList from "./slices/BoxSliceList";

import './BoxList.css'

/**
 * 
 */
export interface BoxListProps {
    boxes: BoxProps[];
}

/**
 * 
 * @param boxes 
 * @returns 
 */
const BoxList: React.FC<BoxListProps> = (props: BoxListProps) => {

    return(
        <IonAccordionGroup className="boxes-list order-boxes-list">
            <div className="boxes-list-wrapper">
            {
                props.boxes?.map((box_props) => (
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
                            <BoxSliceList boxSlicePropsList={box_props.box_slices} />
                        </div>
                    </IonAccordion>
                ))
            }
            </div>
        </IonAccordionGroup>
    );
}

export default BoxList;
