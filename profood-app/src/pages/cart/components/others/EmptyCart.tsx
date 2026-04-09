import React from "react";

import { IonButton } from "@ionic/react";

import { useTranslation } from "react-i18next";

import useGoTo from "../../../../components/hooks/useGoTo";
import { toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";

import './EmptyCart.css';

/**
 * 
 */
interface Props {
    text: string;
    redirectedUrl: string;
}

/**
 * 
 * @param prop 
 * @returns 
 */
const EmptyCart: React.FC<Props> = (props: Props) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div className="empty-cart ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-column flex-center">
                    <div className="d-flex flex-row flex-center mb-3">
                        <p className="empty-cart-text text-center">{props.text}</p>
                    </div>
                {
                    props.redirectedUrl.length > 0 &&
                    <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                        <IonButton
                            type='button'
                            buttonType="button"
                            fill="solid"
                            size="default"
                            className="text-transform-none"
                            onClick={() => goTo(props.redirectedUrl)}
                        >
                            <span>{t('Acheter')}</span>
                        </IonButton>
                    </div>
                }
                </div>
            </div>
        </div>
    );
};

export default EmptyCart;
