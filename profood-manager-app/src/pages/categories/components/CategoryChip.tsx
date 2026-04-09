import React from 'react';

import { useTranslation } from 'react-i18next';

import { CategoryProps } from '../../../types';
import { colorClassNames, random } from '../../../helpers/AssetHelpers';

import "./CategoryChip.css"

/**
 * 
 */
export interface CategoryChipProps {
    category: CategoryProps;
    size?: number;
}

/**
 * 
 * @param props 
 * @returns 
 */
const CategoryChip: React.FC<CategoryChipProps> = ({category, size = 50} : CategoryChipProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='chip category-chip'>
            <div className="d-flex align-items-center">
                <div className={`img-wrapper rounded-sm d-flex flex-center w-${size}px h-${size}px ${!category.illustration ? 'bs-bg-light-'+colorClassNames[random(0, 4)] : ''} me-2`}>
                {
                    (category.illustration)
                    ?
                    <img
                        className='img-fluid'
                        src={category.illustration}
                        alt={t(category.wording)}
                    />
                    :
                    <div className='fw-semibold'>{category.wording.substring(0, 1)}</div>
                }
                </div>
                <div className="wording-wrapper category-wording-wrapper d-flex align-items-center">
                    <span className="wording category-wording fw-semibold d-block">{t(category.wording)}</span>
                </div>
            </div>
        </div>
    );
};

export default CategoryChip;
