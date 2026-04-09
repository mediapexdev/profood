import React from 'react';

import {
    IonButtons,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle
} from '@ionic/react';

import GoToHomeButton from '../../../components/widgets/GoToHomeButton';

import './Header.css';

/**
 * 
 */
interface Props {
    title: string;
}

/**
 * 
 * @returns 
 */
const Header: React.FC<Props> = ({ title }: Props) => {

    return (
        <IonHeader
            translucent={true}
            className='useful-information-page-header'
        >
            {/* begin::Toolbar */}
            <IonToolbar>
                {/* begin::Back button */}
                <IonButtons slot="start">
                    <IonBackButton defaultHref='/'></IonBackButton>
                </IonButtons>
                {/* end::Back button */}
                {/* begin::Title */}
                <IonTitle className='title-color text-center'>{title}</IonTitle>
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
