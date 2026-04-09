import React from "react";

import { Search } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoProduct.css';

/**
 * 
 */
interface NoProductProps {
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const NoProduct: React.FC<NoProductProps> = ({fromSearch = false}: NoProductProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-product ion-padding">
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
                    <p className="no-product-text text-center mb-0 fs-8">{t(!fromSearch ? 'Aucun produit pour le moment' : 'Aucun produit trouvé pour votre recherche')}.</p>
                </div>
            </div>
        </div>
    );
};

export default NoProduct;
