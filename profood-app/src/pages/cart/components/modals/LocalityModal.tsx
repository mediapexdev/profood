import React, { useCallback, useState } from 'react';

import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonList,
    IonTitle,
    IonSearchbar,
    IonToolbar,
    IonLabel,
    IonIcon,
    IonPage
} from '@ionic/react';
import { arrowBack, close } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { LocalityInfo } from '../types';
import { toAbsolutePublicUrl } from '../../../../helpers/AssetHelpers';

import './LocalityModal.css';

/**
 * 
 */
interface LocalityModalProps{
    localitiesInfo: LocalityInfo[];
    onDismiss: (role?: 'cancel' | 'confirm', locality?: string) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const LocalityModal: React.FC<LocalityModalProps> = ({localitiesInfo, onDismiss}: LocalityModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

   /**
     * 
     */
    // const [filteredItems, setFilteredItems] = useState<LocalityInfo[]>([...props.localitiesInfo]);
    const [filteredItems, setFilteredItems] = useState<LocalityInfo[]>([]);

    /**
     * 
     */
    const [searchedLocality, setSearchedLocality] = useState<string>('');

    /**
     * 
     */
    const [selectedLocality, setSelectedLocality] = useState<string | undefined>(undefined);

    /**
     * 
     */
    const [localitySelected, setLocalitySelected] = useState<boolean>(false);

    /**
     * Update the rendered view with the provided search query.
     * If no query is provided, all data will be rendered.
     * 
     * @param searchQuery 
     */
    const filterList = useCallback((searchQuery: string | null | undefined) => {
        setSearchedLocality(searchQuery as string);
        /**
         * If no search query is defined,
         * return all options.
         */
        if(searchQuery === undefined || searchQuery === null || !searchQuery.length){
            // setFilteredItems([...props.localitiesInfo]);
            setFilteredItems([]);
        }
        else {
            /**
             * Otherwise, normalize the search
             * query and check to see which items
             * contain the search query as a substring.
             */
            const normalizedQuery = searchQuery.toLowerCase();

            setFilteredItems(
                localitiesInfo.filter((locality_info) => {
                    return locality_info.wording.toLowerCase().indexOf(normalizedQuery) > -1;
                    // return locality_info.wording.toLowerCase().includes(normalizedQuery);
                    // return locality_info.wording.toLowerCase().includes(normalizedQuery) || locality_info.commune_wording.toLowerCase().includes(normalizedQuery);
                })
            );
        }
    }, [localitiesInfo]);

    /**
     * 
     * @param ev 
     */
    const searchbarInput = useCallback((ev: any) => {
        filterList(ev.target.value);
    }, [filterList]);

    /**
     * 
     */
    const cancelSelectedLocality = useCallback(() => {
        setSearchedLocality('');
        setLocalitySelected(false);
        setFilteredItems([]);
        setSelectedLocality(undefined);
    }, []);

    /**
     * 
     * @param selected_locality_info 
     */
    const updateSelectedLocality = useCallback((selected_locality_info: LocalityInfo) => {
        setSelectedLocality(selected_locality_info.wording);
        setLocalitySelected(true);
        setFilteredItems([]);
    }, []);

    /**
     * 
     * @returns 
     */
    const showLocalityList = useCallback(() => {

        if(filteredItems.length > 0){
            return (
                <IonList
                    id="localitiesList"
                    className='px-1'
                >
                {
                    filteredItems.map((item) => (
                        <IonItem
                            button={true}
                            lines='full'
                            key={item.id}
                            onClick={() => updateSelectedLocality(item)}
                        >
                            <IonLabel className='content-color font-sm ion-text-wrap'>{item.wording}</IonLabel>
                        </IonItem>
                    ))
                }
                </IonList>
            );
        }
        else{
            return (
                <div className="no-locality ion-padding">
                {
                    (!searchedLocality)
                    ?
                    <div className="d-flex flex-column flex-center">
                        <div className="image-wrapper mt-10">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/find-locality3.png')}
                                alt="Illustration"
                            />
                        </div>
                    </div>
                    :
                    <div className="d-flex flex-column flex-center">
                        <div className="d-flex flex-column flex-center">
                            <div className="d-flex flex-row flex-center py-3">
                                <p className="no-locality-text text-center content-color">{t('Aucun résultat pour')}: <b>{searchedLocality}</b></p>
                            </div>
                        </div>
                    </div>
                }
                </div>
            );
        }
    }, [filteredItems, searchedLocality, t, updateSelectedLocality]);

    /**
     * 
     * @returns 
     */
    const showContent = useCallback(() => {

        if(!localitySelected){
            return showLocalityList();
        }
        else{
            return (
                <div className='locality d-flex flex-column ion-padding'>
                    <div className="d-flex flex-center mb-5">
                        <div className="locality-illustration-wrapper image-wrapper mt-8">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/location.png')}
                                className='locality-illustration'
                                alt="Illustration"
                            />
                        </div>
                    </div>
                    <div className="d-flex flex-center">
                        {/* <IonIcon
                            icon={locationOutline}
                            // size="large"
                            className="fs-3 me-1"
                        /> */}
                        <IonLabel className="locality-text title-color font-md fw-semibold p-0">{selectedLocality}</IonLabel>
                    </div>
                    <div className="d-flex flex-column mt-8">
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='solid'
                            size='default'
                            color='primary'
                            expand="block"
                            id='btnConfirmLocality'
                            className='text-transform-none fw-semibold'
                            onClick={() => onDismiss('confirm', selectedLocality)}
                        >
                            <span style={{color: '#fff'}}>{t('Confirmer et continuer')}</span>
                        </IonButton>
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='solid'
                            size='default'
                            color='light'
                            expand="block"
                            id='btnCancelPayment'
                            className='text-transform-none fw-semibold'
                            onClick={() => onDismiss('cancel')}
                        >
                            <span>{t('Annuler')}</span>
                        </IonButton>
                    </div>
                </div>
            );
        }
    }, [localitySelected, onDismiss, selectedLocality, showLocalityList, t]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                    {
                        (!localitySelected)
                        ?
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='clear'
                            size='large'
                            color='dark'
                            onClick={() => onDismiss('cancel')}
                        >
                            <IonIcon icon={close} />
                        </IonButton>
                        :
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='clear'
                            size='large'
                            color='dark'
                            onClick={cancelSelectedLocality}
                        >
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    }
                    </IonButtons>
                    <IonTitle className='title-color'>{t('Adresse de livraison')}</IonTitle>
                </IonToolbar>
                {
                    !localitySelected &&
                    <IonToolbar>
                        <IonSearchbar
                            placeholder={t('Rechercher votre localité')}
                            autoFocus={true}
                            onIonInput={searchbarInput}
                        />
                    </IonToolbar>
                }
            </IonHeader>
            <IonContent>
            {
                showContent()
            }
            </IonContent>
        </IonPage>
    );
};

export default LocalityModal;
