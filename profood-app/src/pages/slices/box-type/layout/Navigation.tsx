import { useContext } from "react";

import { IonCol, IonLabel, IonRow, IonSegment, IonSegmentButton } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { CategoryPropsList } from "../../../../components/categories/CategoryList";
import { SelectedCategoryContext } from "../BoxTypeSlicesPage";

import BeefMeatIconString from "../../../../components/icons/png/BeefIconString";
import SheepMeatIconString from "../../../../components/icons/png/SheepMeatIconString";
import PoultryMeatIconString from "../../../../components/icons/png/PoultryMeatIconString";
import MixedMeatIconString from "../../../../components/icons/png/MixedMeatIconString";

import './Navigation.css';

/**
 * 
 */
const images: string[] = [
    BeefMeatIconString,
    SheepMeatIconString,
    PoultryMeatIconString,
    MixedMeatIconString
];

/**
 * 
 * @param param0 
 * @returns 
 */
const Navigation: React.FC<CategoryPropsList> = ({categoryPropsList}) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { selectedCategory, changeSelectedCategory } = useContext(SelectedCategoryContext);

    return (
        <IonSegment
            scrollable={true}
            className="navigation category-navigation"
            value={selectedCategory ? selectedCategory?.wording : 'Tout'}
        >
            <IonSegmentButton
                key={0}
                value="Tout"
                onClick={() => {
                    changeSelectedCategory({
                        id: 0,
                        wording: 'Tout',
                        illustration: '',
                        slices_count: 0
                    });
                }}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-img"
                    >
                        <img
                            src={images[3]}
                            className={`n_${3}`}
                            alt="Icône"
                        />
                    </IonCol>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t('Tout')}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
        {
            categoryPropsList.map((categoryProps, index) =>
                <IonSegmentButton
                    key={categoryProps.id}
                    value={categoryProps.wording}
                    onClick={() => {
                        changeSelectedCategory({
                            id: categoryProps.id,
                            wording: categoryProps.wording,
                            illustration: categoryProps.illustration,
                            slices_count: categoryProps.slices_count
                        });
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

export default Navigation;
