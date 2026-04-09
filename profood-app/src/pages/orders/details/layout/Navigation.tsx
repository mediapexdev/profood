import React from 'react';

import { IonCol, IonLabel, IonRow, IonSegment, IonSegmentButton } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useOrderDetailsMenuTabsContext } from '../../components/contexts/OrderDetailsMenuTabsProvider';

import './Navigation.css';

/**
 * 
 */
const tabsTitles: string[] = [
    'boxes',
    "unit",
    'payment'
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
    const {currentMenuTab, toggleMenuTab} = useOrderDetailsMenuTabsContext();

    /**
     * 
     */
    return (
        <IonSegment
            className="navigation order-details-navigation"
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
                value='payment'
                onClick={() => toggleMenuTab(3)}
                // id='btnMenuOrder'
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t('Paiement')}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
        </IonSegment>
    );
};

export default Navigation;
