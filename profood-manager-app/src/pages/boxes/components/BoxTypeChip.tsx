import React from 'react';

// import { useTranslation } from 'react-i18next';

import { BoxTypeProps } from '../../../types';
import { colorClassNames, random } from '../../../helpers/AssetHelpers';

import "./BoxTypeChip.css"

/**
 * 
 */
export interface BoxTypeChipProps {
    boxType: BoxTypeProps;
    size?: number;
}

/**
 * 
 * @param props 
 * @returns 
 */
const BoxTypeChip: React.FC<BoxTypeChipProps> = ({boxType, size = 50} : BoxTypeChipProps) => {
    /**
     * 
     */
    // const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='chip boxType-chip'>
            <div className="d-flex align-items-center">
                <div className={`img-wrapper rounded-sm d-flex flex-center w-${size}px h-${size}px ${!boxType.illustration ? 'bs-bg-light-'+colorClassNames[random(0, 4)] : ''} me-2`}>
                {
                    (boxType.illustration)
                    ?
                    <img
                        className='img-fluid'
                        src={boxType.illustration}
                        alt={boxType.wording}
                    />
                    :
                    <div className='fw-semibold'>{boxType.wording.substring(0, 1)}</div>
                }
                </div>
                <div className="wording wrapper boxType-wording-wrapper d-flex align-items-center">
                    <span className="wording boxType-wording fw-semibold d-block">{boxType.wording}</span>
                </div>
            </div>
        </div>
    );
};

export default BoxTypeChip;
