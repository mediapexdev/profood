import React from 'react';

import {
    IonButtons,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import GoToHomeButton from '../../../components/widgets/GoToHomeButton';

import './Header.css';

/**
 * 
 * @returns 
 */
const Header: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    return (
        <IonHeader
            translucent={true}
            className='categories-page-header'
        >
            {/* begin::Toolbar */}
            <IonToolbar>
                {/* begin::Back button */}
                <IonButtons slot="start">
                    <IonBackButton defaultHref='/'></IonBackButton>
                </IonButtons>
                {/* end::Back button */}
                {/* begin::Title */}
                <IonTitle className='title-color text-center'>{t('Catégories')}</IonTitle>
                {/* end::Title */}
                {/* begin::Go to home button */}
                <IonButtons slot="end">
                    <GoToHomeButton />
                </IonButtons>
                {/* end::Go to home button */}
            </IonToolbar>
            {/* end::Toolbar */}
        </IonHeader>
    );
};

export default Header;
