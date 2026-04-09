import React from 'react';

import { IonCol, IonLabel, IonRow, IonSegment, IonSegmentButton } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useOrdersMenuTabs } from '../components/contexts/OrdersMenuTabsProvider';

import './Navigation.css';

/**
 * 
 */
const tabsTitles: string[] = [
    'all',
    'in-progress',
    'delivered'
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
    const {currentMenuTab, toggleMenuTab} = useOrdersMenuTabs();

    /**
     * 
     */
    return (
        <IonSegment
            className="navigation orders-navigation"
            value={tabsTitles[currentMenuTab - 1]}
        >
            <IonSegmentButton
                value='all'
                onClick={() => toggleMenuTab(1)}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t("Tout")}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
            <IonSegmentButton
                value='in-progress'
                onClick={() => toggleMenuTab(2)}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t("En cours")}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
            <IonSegmentButton
                value='delivered'
                onClick={() => toggleMenuTab(3)}
            >
                <IonRow>
                    <IonCol
                        size="12"
                        className="col-text"
                    >
                        <IonLabel>{t("Livrées")}</IonLabel> 
                    </IonCol>
                </IonRow>
            </IonSegmentButton>
        </IonSegment>
    );
};

export default Navigation;
