import React from "react";

import { IonContent, IonPage } from "@ionic/react";

import Error404 from "./components/Error404";

import './NotFoundPage.css';

/**
 * 
 * @returns 
 */
const NotFoundPage: React.FC = () => {

    return (
        <IonPage id="notFoundPage">
            <IonContent
                id="notFoundPageContent"
                className="ion-padding"
            >
                <Error404 />
            </IonContent>
        </IonPage>
    );
};

export default NotFoundPage;
