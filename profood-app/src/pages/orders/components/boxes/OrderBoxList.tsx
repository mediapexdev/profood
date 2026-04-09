import React from "react";

import { useTranslation } from "react-i18next";

import NoOrderProduct from "../NoOrderProduct";
import BoxList, { BoxListProps } from "../../../../components/box/BoxList";

import './OrderBoxList.css'

/**
 * 
 * @param prop 
 * @returns 
 */
const OrderBoxList: React.FC<BoxListProps> = (prop: BoxListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    if(!prop.boxes.length) {
        return (
            <NoOrderProduct text={`${t('Aucun Box pour cette commande')}.`} />
        );
    }
    return(
        <BoxList boxes={prop.boxes} />
    );
}

export default OrderBoxList;
