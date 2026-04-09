import React from 'react';

import { useTranslation } from 'react-i18next';

import { SliceProps } from '../../../types';
import { colorClassNames, random } from '../../../helpers/AssetHelpers';

import "./ProductChip.css"

/**
 * 
 */
export interface ProductChipProps {
    product: SliceProps;
    size?: number;
}

/**
 * 
 * @param props 
 * @returns 
 */
const ProductChip: React.FC<ProductChipProps> = ({product, size = 50} : ProductChipProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='chip product-chip'>
            <div className="d-flex align-items-center">
                <div className={`img-wrapper d-flex flex-center w-${size}px h-${size}px ${!product.illustration ? 'bs-bg-light-'+colorClassNames[random(0, 4)] : ''} me-2`}>
                {
                    (product.illustration)
                    ?
                    <img
                        className='img-fluid'
                        src={product.illustration}
                        // src={toAbsolutePublicUrl(`/assets/media/images/illustrations/slices/${product.illustration}`)}
                        alt={t(product.wording)}
                    />
                    :
                    <div className='fw-semibold'>{product.wording.substring(0, 1)}</div>
                }
                </div>
                <div className="wording wrapper product-wording-wrapper d-flex align-items-center">
                    <span className="wording product-wording fw-semibold d-block">{t(product.wording)}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductChip;
