import React from "react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoOrder.css';

/**
 * 
 * @returns 
 */
const NoOrder: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-order ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-column flex-center">
                    <div className="d-flex flex-row flex-center mb-3">
                        <p className="no-order-text text-center">{t('Aucune commande pour le moment')} !</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoOrder;
