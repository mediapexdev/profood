import React from 'react';

import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
    useIonViewDidEnter
} from '@ionic/react';

import Header from './layout/Header';
import BoxTypeList from '../../components/box/BoxTypeList';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import { useDataContext } from '../../contexts/DataProvider';

import './BoxTypesPage.css';

/**
 * 
 * @returns 
 */
const BoxTypesPage: React.FC = () => {
    /**
     * 
     */
    const toggleTabBar = useToggleTabBar();

    /**
     * 
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
    });

    /**
     * 
     */
    const { boxTypesProps } = useDataContext();

    /**
     * 
     * @param event 
     */
    const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            // Any calls to load data go here
            window.location.reload();
            event.detail.complete();
        }, 2000);
    };
    return (
        <IonPage id='boxTypesPage'>
            <Header />
            <IonContent
                id='boxTypesPageContent'
                className='ion-padding'
            >
                <IonRefresher
                    slot='fixed'
                    onIonRefresh={handleRefresh}
                >
                    <IonRefresherContent />
                </IonRefresher>
                <div className='app-container'>
                    <div className='wrapper'>
                        <BoxTypeList boxTypePropsList={boxTypesProps} />
                    </div>
                    <div className="elfsight-app-ff865515-63a6-491f-97f8-c6fa0c5b8afa"></div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default BoxTypesPage;
