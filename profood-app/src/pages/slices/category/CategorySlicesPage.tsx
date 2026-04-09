import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { IonContent, IonPage} from '@ionic/react';

import Header from './layout/Header';
import Footer from './layout/Footer';
import ContentBody from './ContentBody';
import { CategoryProps } from '../../../components/categories/Category';
import { SelectedCategoryContextType } from '../types';
import CategoryProvider from '../../../contexts/CategoryProvider';
import SlicePriceVisibilityProvider from '../../../contexts/SlicePriceVisibilityProvider';
import ConnectionReminderAlertProvider from '../../../contexts/ConnectionReminderAlertProvider';
import { useDataContext } from '../../../contexts/DataProvider';
import NotFoundPage from '../../errors/NotFoundPage';

import './CategorySlicesPage.css';

/**
 * 
 */
export const SelectedCategoryContext = createContext<SelectedCategoryContextType>({
    selectedCategory: undefined,
    changeSelectedCategory: () => {/* */}
});

/**
 * 
 * @returns 
 */
const CategorySlicesPage: React.FC = () => {
    /**
     * 
     */
    const { id } = useParams<{ id?: string; }>();

    /**
     * 
     */
    const { categoriesProps } = useDataContext();

    /**
	 * 
	 */
    const [selectedCategory, setSelectedCategory] = useState<CategoryProps|undefined>(undefined);

    /**
     * 
     * @param category 
     */
    const changeSelectedCategory = useCallback((category?: CategoryProps) => {
        setSelectedCategory(category);
    }, []);

    /**
     * 
     */
    useEffect(() => {
        setSelectedCategory(categoriesProps.find((c) => c.id === Number(id)))
	}, [categoriesProps, id]);

    return (
        selectedCategory === undefined
        ?
            <NotFoundPage />
        :
        <SelectedCategoryContext.Provider
            value={{
                selectedCategory,
                changeSelectedCategory
            }}
        >
            <CategoryProvider>
                <SlicePriceVisibilityProvider>
                    <ConnectionReminderAlertProvider>
                        <IonPage>
                            <Header />
                            <IonContent>
                                <ContentBody />
                            </IonContent>
                            <Footer />
                        </IonPage>
                    </ConnectionReminderAlertProvider>
                </SlicePriceVisibilityProvider>
            </CategoryProvider>
        </SelectedCategoryContext.Provider>
    );
};

export default CategorySlicesPage;
