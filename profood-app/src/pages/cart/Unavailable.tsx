import React from "react";

import { IonButton } from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import useGoToSignIn from "../../components/hooks/useGoToSignIn";

import './Unavailable.css';

/**
 * 
 * @returns 
 */
const Unavailable: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goToSignIn = useGoToSignIn();

    /**
     * 
     */
    return (
        <div className="unavailable-cart ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-column flex-center">
                    <div className="d-flex flex-row flex-center mb-3">
                        <p className="unavailable-cart-text text-center">{t('Veuillez vous connecter pour accéder au panier')} !</p>
                    </div>
                    <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                        <IonButton
                            buttonType="button"
                            fill="solid"
                            size="default"
                            className="text-transform-none"
                            onClick={() => goToSignIn()}
                        >
                            <span>{t('Se connecter')}</span>
                        </IonButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unavailable;
