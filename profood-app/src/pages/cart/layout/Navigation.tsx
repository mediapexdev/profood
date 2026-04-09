import React from 'react';

import { IonCol, IonLabel, IonRow, IonSegment, IonSegmentButton } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useCartMenuTabsContext } from '../components/contexts/CartMenuTabsProvider';

import './Navigation.css';

/**
 * 
 */
const tabsTitles: string[] = [
    'boxes',
    "unit",
    'order'
];

/**
 * 
 * @returns 
 */
const Navigation: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {currentMenuTab, toggleMenuTab} = useCartMenuTabsContext();

    return (
        <IonSegment
            className="navigation cart-navigation"
            value={tabsTitles[currentMenuTab - 1]}
        >
            <IonSegmentButton
                value='boxes'
                onClick={() => toggleMenuTab(1)}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>Boxes</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
            <IonSegmentButton
                value="unit"
                onClick={() => toggleMenuTab(2)}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t('Au détail')}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
            <IonSegmentButton
                value='order'
                onClick={() => toggleMenuTab(3)}
                id='btnMenuOrder'
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t('Commander')}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
        </IonSegment>
    );
};

export default Navigation;
