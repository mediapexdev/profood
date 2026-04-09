import React from "react";

import { IonButton, useIonRouter } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './Error404.css';

/**
 * 
 * @returns 
 */
const Error404: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const navigate = useIonRouter();

    /**
     * 
     */
    const goBack = () => {
        navigate.goBack();
    };
    return (
        <div className="error-404 ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/media/images/illustrations/404-error.png')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-column flex-center">
                    <div className="d-flex flex-row flex-center mb-3">
                    </div>
                    <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                        <IonButton
                            buttonType="button"
                            fill="solid"
                            size="default"
                            className="text-transform-none"
                            onClick={() => goBack()}
                        >
                            <span>{t('Retour')}</span>
                        </IonButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error404;
