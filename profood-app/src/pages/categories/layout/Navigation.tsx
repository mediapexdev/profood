import React, { useContext } from 'react';

import {
    IonCol,
    IonLabel,
    IonRow,
    IonSegment,
    IonSegmentButton
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { SelectedCategoryContext } from '../CategoriesPage';
import { CategoryPropsList } from '../../../components/categories/CategoryList';

import BeefMeatIconString from '../../../components/icons/png/BeefIconString';
import SheepMeatIconString from '../../../components/icons/png/SheepMeatIconString';
import PoultryMeatIconString from '../../../components/icons/png/PoultryMeatIconString';
import MixedMeatIconString from '../../../components/icons/png/MixedMeatIconString';

/**
 * Category icon map — index matches the order categories come from the API
 * (Bœuf → Mouton → Volaille). MixedMeatIconString is used for the "Tout"
 * catch-all button that has no API-backed category.
 */
const CATEGORY_IMAGES: string[] = [
    BeefMeatIconString,
    SheepMeatIconString,
    PoultryMeatIconString,
    MixedMeatIconString,
];

/**
 * CategoryNavigation — horizontally scrollable segment strip rendered in the
 * IonFooter of CategoriesPage.
 *
 * Each chip maps to a CategoryProps entry from DataContext.  Tapping one
 * updates SelectedCategoryContext, which CategoriesPage uses to filter the
 * SliceList rendered above. A "Tout" chip resets the filter to show all
 * products.
 *
 * Behaviour:
 * - Active category is highlighted via IonSegment's controlled `value` prop.
 * - "Tout" maps to value="Tout" (id 0) — consistent with how the sibling
 *   BoxTypeSlicesPage navigation handles this case.
 * - If the categories list is empty the component renders nothing, letting the
 *   parent footer collapse gracefully.
 */
const CategoryNavigation: React.FC<CategoryPropsList> = ({ categoryPropsList }) => {
    const { t } = useTranslation();

    const { selectedCategory, changeSelectedCategory } = useContext(SelectedCategoryContext);

    /**
     * Resolve the active segment value.
     *
     * When no category is selected (undefined) or the "Tout" sentinel is active
     * (id === 0) the segment should highlight the "Tout" button.
     */
    const activeValue =
        !selectedCategory || selectedCategory.id === 0
            ? 'Tout'
            : selectedCategory.wording;

    if (!categoryPropsList.length) {
        return null;
    }

    return (
        <IonSegment
            scrollable={true}
            className="navigation category-navigation"
            value={activeValue}
        >
            {/* "Tout" — resets the category filter */}
            <IonSegmentButton
                key={0}
                value="Tout"
                onClick={() =>
                    changeSelectedCategory({ id: 0, wording: 'Tout', illustration: '', slices_count: 0 })
                }
            >
                <IonRow>
                    <IonCol size="12" className="col-img">
                        <img
                            src={CATEGORY_IMAGES[3]}
                            className="n_3"
                            alt={t('Tout')}
                        />
                    </IonCol>
                    <IonCol size="12" className="col-text">
                        <IonLabel>{t('Tout')}</IonLabel>
                    </IonCol>
                </IonRow>
            </IonSegmentButton>

            {categoryPropsList.map((categoryProps, index) => (
                <IonSegmentButton
                    key={categoryProps.id}
                    value={categoryProps.wording}
                    onClick={() => changeSelectedCategory({ ...categoryProps })}
                >
                    <IonRow>
                        <IonCol size="12" className="col-img">
                            {/*
                             * Fall back to the mixed-meat icon if the API returns
                             * more categories than we have icons — avoids a broken
                             * <img src={undefined}> in production.
                             */}
                            <img
                                src={CATEGORY_IMAGES[index] ?? CATEGORY_IMAGES[3]}
                                className={`n_${index}`}
                                alt={t(categoryProps.wording)}
                            />
                        </IonCol>
                        <IonCol size="12" className="col-text">
                            <IonLabel>{t(categoryProps.wording)}</IonLabel>
                        </IonCol>
                    </IonRow>
                </IonSegmentButton>
            ))}
        </IonSegment>
    );
};

export default CategoryNavigation;
