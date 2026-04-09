import React from "react";

import { Search } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoCategory.css';

/**
 * 
 */
interface NoCategoryProps {
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const NoCategory: React.FC<NoCategoryProps> = ({fromSearch = false}: NoCategoryProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-category ion-padding">
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
                    <p className="no-category-text text-center mb-0 fs-8">{t(!fromSearch ? 'Aucune catégorie pour le moment' : 'Aucune catégorie trouvée pour votre recherche')}.</p>
                </div>
            </div>
        </div>
    );
};

export default NoCategory;
