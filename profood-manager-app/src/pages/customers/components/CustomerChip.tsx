import React from 'react';
import { Link } from 'react-router-dom';

// import { useTranslation } from 'react-i18next';

import { CustomerProps } from '../../../types';
import { colorClassNames, random } from '../../../helpers/AssetHelpers';

import "./CustomerChip.css"

/**
 * 
 */
export interface CustomerChipProps {
    customer: CustomerProps;
    size?: number;
    url?: string;
}

/**
 * 
 * @param props 
 * @returns 
 */
const CustomerChip: React.FC<CustomerChipProps> = ({customer, size = 32, url} : CustomerChipProps) => {
    /**
     * 
     */
    // const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='chip customer-chip'>
            <div className="d-flex align-items-center">
                <div className={`img-wrapper rounded-circle d-flex flex-center w-${size}px h-${size}px ${!customer.user.avatar ? 'bs-bg-light-' + colorClassNames[random(0, 4)] : ''} me-2`}>
                {
                    (customer.user.avatar)
                    ?
                    <img
                        className='img-fluid'
                        src={customer.user.avatar}
                        alt={`${customer.user.first_name} ${customer.user.last_name}`}
                    />
                    :
                    <div className='fw-semibold'>{customer.user.first_name.substring(0, 1)}</div>
                }
                </div>
                <div className="full-name-wrapper d-flex align-items-center">
                {
                    url
                    ?
                    <Link
                        to={url}
                        className='link-info2 link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover'
                    >
                        <span className="full-name fw-semibold d-block">{`${customer.user.first_name} ${customer.user.last_name}`}</span>
                    </Link>
                    :
                    <span className="full-name fw-semibold d-block">{`${customer.user.first_name} ${customer.user.last_name}`}</span>
                }
                </div>
            </div>
        </div>
    );
};

export default CustomerChip;
