import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { IonContent, IonPage } from '@ionic/react';

import Header from './layout/Header';
import Footer from './layout/Footer';
import ContentBody from './ContentBody';
import { BoxTypeProps } from '../../../components/box/BoxType';
import BoxTypeProvider from '../../../contexts/BoxTypeProvider';
import { CategoryProps } from '../../../components/categories/Category';
import { SelectedCategoryContextType } from '../types';
import SlicePriceVisibilityProvider from '../../../contexts/SlicePriceVisibilityProvider';
import ConnectionReminderAlertProvider from '../../../contexts/ConnectionReminderAlertProvider';
import { useDataContext } from '../../../contexts/DataProvider';
import NotFoundPage from '../../errors/NotFoundPage';

import './BoxTypeSlicesPage.css';

/**
 * 
 */
export const CurrentBoxTypeContext = createContext<BoxTypeProps|undefined>(undefined);

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
const BoxTypeSlicesPage: React.FC = () => {
    /**
     * 
     */
    const { id } = useParams<{ id?: string; }>();

    /**
     * 
     */
    const { boxTypesProps } = useDataContext();

    /**
	 * 
	 */
    const [selectedBoxType, setSelectedBoxType] = useState<BoxTypeProps|undefined>(undefined);

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
        setSelectedBoxType(boxTypesProps.find((b) => b.id === Number(id)))
	}, [boxTypesProps, id]);

    return (
        selectedBoxType === undefined
        ?
            <NotFoundPage />
        :
        <CurrentBoxTypeContext.Provider value={selectedBoxType}>
            <SelectedCategoryContext.Provider value={{
                selectedCategory,
                changeSelectedCategory
            }}>
                <BoxTypeProvider>
                    <SlicePriceVisibilityProvider>
                        <ConnectionReminderAlertProvider>
                            <IonPage className='box-type-slices-page'>
                                <Header />
                                <IonContent>
                                    <ContentBody />
                                </IonContent>
                                <Footer />
                            </IonPage>
                        </ConnectionReminderAlertProvider>
                    </SlicePriceVisibilityProvider>
                </BoxTypeProvider>
            </SelectedCategoryContext.Provider>
        </CurrentBoxTypeContext.Provider>
    );
};

export default BoxTypeSlicesPage;
