import React from 'react';

import {
    IonContent,
    IonPage
} from '@ionic/react';

import Header from './Header';

import './Layout.css';

/**
 * 
 */
interface Props {
    widgetTitle: string;
    children: React.ReactNode;
    contentClassName: string;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const Layout: React.FC<Props> = ({ widgetTitle, children, contentClassName }: Props) => {

    return (
        <IonPage className='useful-information-page'>
            <Header title={widgetTitle} />
            <IonContent className={`useful-information-content ion-padding ${contentClassName}`}>{ children }</IonContent>
        </IonPage>
    );
};

export default Layout;
