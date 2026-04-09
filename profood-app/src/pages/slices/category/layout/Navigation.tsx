import React, { useContext } from "react";

import { IonCol, IonLabel, IonRow, IonSegment, IonSegmentButton } from "@ionic/react";

import { useTranslation } from 'react-i18next';

import { SelectedCategoryContext } from "../CategorySlicesPage";
import { CategoryPropsList } from "../../../../components/categories/CategoryList";

import BeefMeatIconString from "../../../../components/icons/png/BeefIconString";
import SheepMeatIconString from "../../../../components/icons/png/SheepMeatIconString";
import PoultryMeatIconString from "../../../../components/icons/png/PoultryMeatIconString";

import './Navigation.css';

/**
 * 
 */
const images : string[] = [
    BeefMeatIconString,
    SheepMeatIconString,
    PoultryMeatIconString
];

/**
 * 
 * @param param0 
 * @returns 
 */
const CategoryNavigation: React.FC<CategoryPropsList> = ({categoryPropsList}) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { selectedCategory, changeSelectedCategory } = useContext(SelectedCategoryContext);

    /**
     * 
     */
    return (
        <IonSegment
            scrollable={true}
            className="navigation category-navigation"
            value={selectedCategory?.wording}
        >
        {
            categoryPropsList.map((categoryProps, index) =>
                <IonSegmentButton
                    key={categoryProps.id}
                    value={categoryProps.wording}
                    onClick={() => {
                        changeSelectedCategory({...categoryProps});
                    }}
                >
                    <IonRow>
                        <IonCol
                            size="12"
                            className="col-img"
                        >
                            <img
                                src={images[index]}
                                className={`n_${index}`}
                                alt="Icône"
                            />
                        </IonCol>
                        <IonCol
                            size="12"
                            className="col-text"
                        >
                            <IonLabel>{t(categoryProps.wording)}</IonLabel> 
                        </IonCol>
                    </IonRow>
                </IonSegmentButton>
            )
        }
        </IonSegment>
    );
};

export default CategoryNavigation;
