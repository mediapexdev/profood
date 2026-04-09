import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';

interface NoPromotionProps {
    /** When true, renders a "no results" message suited for an active search query. */
    fromSearch?: boolean;
}

/**
 * Empty-state component shown in the promotions list when there is no data to display.
 * Renders a different visual depending on whether the empty state originates from a search
 * (no results found) or from a completely empty dataset.
 */
const NoPromotion: React.FC<NoPromotionProps> = ({ fromSearch = false }) => {
    const { t } = useTranslation();

    return (
        <div className='d-flex flex-column flex-center py-10'>
            {fromSearch ? (
                <React.Fragment>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className='text-gray-400 mb-4' size='2x' />
                    <span className='fs-7 text-gray-600'>
                        {t('Aucune promotion trouvée pour votre recherche')}
                    </span>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <img
                        src={toAbsolutePublicUrl('/assets/media/images/illustrations/no-data.svg')}
                        alt='No data'
                        className='w-150px mb-4'
                    />
                    <span className='fs-7 text-gray-600'>
                        {t('Aucune promotion pour le moment')}
                    </span>
                </React.Fragment>
            )}
        </div>
    );
};

export default NoPromotion;
