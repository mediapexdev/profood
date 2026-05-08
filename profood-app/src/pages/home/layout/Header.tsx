import React from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonMenuButton, IonToolbar } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';

import Logo from '../../../components/Logo';
import useGoTo from '../../../components/hooks/useGoTo';

import './Header.css';

const Header: React.FC = () => {
    const goTo = useGoTo();

    return (
        <IonHeader
            translucent={true}
            className='translucent-style'
        >
            <IonToolbar>
                <IonButtons slot="start">
                    <IonMenuButton />
                </IonButtons>

                <div className='logo-wrapper d-flex flex-center'>
                    <Logo />
                </div>

                <IonButtons slot="end">
                    <IonButton
                        aria-label="Rechercher"
                        onClick={() => goTo('/search')}
                    >
                        <IonIcon slot="icon-only" icon={searchOutline} />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;
