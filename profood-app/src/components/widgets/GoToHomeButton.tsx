import React from 'react';

import { IonButton, IonIcon } from '@ionic/react';

import { homeOutline, homeSharp } from 'ionicons/icons';

import useGoToHome from '../hooks/useGoToHome';

import './GoToHomeButton.css';

/**
 * 
 * @returns 
 */
const GoToHomeButton: React.FC = () => {
    /**
     * 
     */
    const goToHome = useGoToHome();

    return (
        <IonButton
            fill='clear'
            slot='icon-only'
            onClick={() => goToHome()}
        >
            <IonIcon
                md={homeSharp}
                ios={homeOutline}
            />
        </IonButton>
    );
};

export default GoToHomeButton;
