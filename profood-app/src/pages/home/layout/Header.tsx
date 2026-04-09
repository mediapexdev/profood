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
                <div className='logo-wrapper d-flex flex-center'>
                    <Logo />
                </div>
                {/* end::Logo */}
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;
