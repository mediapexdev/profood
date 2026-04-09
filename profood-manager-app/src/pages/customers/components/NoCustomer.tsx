import React from "react";

import { PeopleFill, Search } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import './NoCustomer.css';

/**
 * 
 */
interface NoCustomerProps {
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const NoCustomer: React.FC<NoCustomerProps> = ({fromSearch = false}: NoCustomerProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-customer ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="d-flex flex-column flex-center mt-12 gap-3">
                {
                    fromSearch
                    ?
                    <div className="icon-wrapper">
                        <Search size={32} />
                    </div>
                    :
                    <div className="icon-wrapper text-muted">
                        <PeopleFill size={64} />
                    </div>
                }
                    <p className="no-customer-text text-center mb-0 fs-8">{t(!fromSearch ? 'Aucun client pour le moment' : 'Aucun client trouvé pour votre recherche')}.</p>
                </div>
            </div>
        </div>
    );
};

export default NoCustomer;
