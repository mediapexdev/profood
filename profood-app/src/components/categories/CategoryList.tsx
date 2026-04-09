import React from 'react';

import { IonCol, IonGrid, IonRow } from '@ionic/react';

import Category, { CategoryProps } from './Category';

/**
 * 
 */
export interface CategoryPropsList {
    categoryPropsList: CategoryProps[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CategoryList: React.FC<CategoryPropsList> = ({categoryPropsList}: CategoryPropsList) => {

    return (
        <IonGrid className="category-list-widget">
            <IonRow>
            {
                categoryPropsList.map((category_props) => (
                    <IonCol
                        size="6" size-sm="4" size-lg='3'
                        key={category_props.id}
                    >
                        <Category {...category_props} />
                    </IonCol>
                ))
            }
            </IonRow>
        </IonGrid>
    );
};

export default CategoryList;
