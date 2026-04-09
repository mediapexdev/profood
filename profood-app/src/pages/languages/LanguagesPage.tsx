import React from 'react';

import { IonContent, IonItem, IonList, IonPage, IonRadio, IonRadioGroup, RadioGroupCustomEvent } from '@ionic/react';

import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';

import Header from './layout/Header';
import { FrenchFlagString } from '../../components/icons/svg/flags/FrenchFlag';
import { AmericanFlagString } from '../../components/icons/svg/flags/AmericanFlag';

import './LanguagesPage.css';

/**
 * 
 */
interface LanguageInfo {
    name: string;
    value: string;
    flag: string;
}

/**
 * 
 * @returns 
 */
const LanguagesPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const languagesInfo: LanguageInfo[] = [
        {
            name: t('Anglais'),
            value: 'en',
            flag: AmericanFlagString
        },
        {
            name: t('Français'),
            value: 'fr',
            flag: FrenchFlagString
        }
    ];

    /**
     * 
     * @param ev 
     */
    const languageChange = (ev: RadioGroupCustomEvent) => {
        const { value } = ev.detail;
        i18n.changeLanguage((value === 'en' || value === 'fr') ? value : 'fr');
        localStorage.setItem('lang', i18n.language);
    };

    /**
     * 
     */
    return (
        <IonPage>
            <Header title={t('Langues')} />
            <IonContent>
                <IonList
                    id="languagesList"
                    className='px-1 pt-5 h-100'
                >
                    <IonRadioGroup
                        value={i18n.language}
                        onIonChange={languageChange}
                    >
                    {
                        languagesInfo.map((language_info, index) => (
                            <IonItem
                                // lines={(index < languagesInfo.length - 1) ? 'full' : 'none'}
                                key={index}
                                lines='full'
                                detail={false}
                            >
                                <IonRadio
                                    value={language_info.value}
                                    labelPlacement='end'
                                    justify="start"
                                    className='ion-text-wrap'
                                    // onIonBlur={() => {console.log('test')}}
                                >
                                    {/* <IonIcon icon={language_info.flag} /> */}
                                    {language_info.name}
                                </IonRadio>
                            </IonItem>
                        ))
                    }
                    </IonRadioGroup>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default LanguagesPage;
