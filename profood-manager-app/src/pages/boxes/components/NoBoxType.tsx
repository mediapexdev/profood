import React from "react";

import { Search } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoBoxType.css';

/**
 * 
 */
interface NoBoxTypeProps {
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const NoBoxType: React.FC<NoBoxTypeProps> = ({fromSearch = false}: NoBoxTypeProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-boxType ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="d-flex flex-column flex-center mt-12 gap-3">
                {
                    fromSearch
                    ?
                    <div className="icon-wrapper">
                        <Search size={32} />
                    </div>
                    :
                    <div className="image-wrapper my-3">
                        <img
                            className="img-fluid"
                            src={toAbsolutePublicUrl('/assets/media/images/illustrations/empty-cart.svg')}
                            alt="Illustration"
                        />
                    </div>
                }
                    <p className="no-boxType-text text-center mb-0 fs-8">{t(!fromSearch ? 'Aucun Box pour le moment' : 'Aucun Box trouvé pour votre recherche')}.</p>
                </div>
            </div>
        </div>
    );
};

export default NoBoxType;
