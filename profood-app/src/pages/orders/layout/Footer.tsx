import React from 'react';

import { IonToolbar, IonFooter } from '@ionic/react';

import Navigation from './Navigation';

import './Footer.css';


/**
 * 
 * @returns 
 */
const Footer: React.FC = () => {
    /**
     * 
     */
    return (
        <IonFooter translucent={true}>
            <IonToolbar>
                <Navigation />
            </IonToolbar>
        </IonFooter>
    );
};

export default Footer;
