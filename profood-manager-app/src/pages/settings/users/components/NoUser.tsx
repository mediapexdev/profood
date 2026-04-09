import React from "react";

import { PeopleFill, Search } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import './NoUser.css';

/**
 * 
 */
interface NoUserProps {
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const NoUser: React.FC<NoUserProps> = ({fromSearch = false}: NoUserProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className="no-user">
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
                    <p className="no-user-text text-center mb-0 fs-8">{t(!fromSearch ? 'Aucun utilisateur pour le moment' : 'Aucun utilisateur trouvé pour votre recherche')}.</p>
                </div>
            </div>
        </div>
    );
};

export default NoUser;
