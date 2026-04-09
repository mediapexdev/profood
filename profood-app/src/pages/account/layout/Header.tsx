import React from 'react';

import { IonButtons, IonHeader, IonMenuButton, IonToolbar } from '@ionic/react';

import Logo from '../../../components/Logo';

import './Header.css';

/**
 * 
 * @returns 
 */
const Header: React.FC = () => {
    /**
     * 
     */
    return (
        <IonHeader
            translucent={true}
            className='translucent-style'
        >
            <IonToolbar>
                {/* begin::Button toggle menu */}
                <IonButtons slot="start">
                    <IonMenuButton />
                </IonButtons>
                {/* end::Button toggle menu */}

                {/* begin::Logo */}
                    <Logo />
                {/* end::Logo */}
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;
