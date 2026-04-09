import React from 'react';

import { IonToolbar, IonFooter } from '@ionic/react';

import CategoryNavigation from './Navigation';
import { useDataContext } from '../../../../contexts/DataProvider';

import './Footer.css';

/**
 * 
 * @returns 
 */
const Footer: React.FC = () => {
    /**
     * 
     */
    const { categoriesProps } = useDataContext();

    /**
     * 
     */
    return (
        <IonFooter
            translucent={true}
            id='boxTypeSlicesPageFooter'
            className='page-footer'
        >
            <IonToolbar>
                <CategoryNavigation categoryPropsList={categoriesProps} />
            </IonToolbar>
        </IonFooter>
    );
};

export default Footer;
