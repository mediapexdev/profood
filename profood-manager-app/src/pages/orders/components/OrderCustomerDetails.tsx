import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

import { CustomerProps } from '../../../types';
import CustomerChip from '../../customers/components/CustomerChip';
import { formatPhoneNumber } from '../../../helpers/AssetHelpers';

import './OrderCustomerDetails.css';

/**
 * 
 * @param customer 
 * @returns 
 */
const OrderCustomerDetails: React.FC<CustomerProps> = (customer: CustomerProps) => {

    return (
        <div className='order-customer-details-widget'>
            <div className='fs-8'>
                <CustomerChip
                    customer={customer}
                    size={50}
                    url={`/clients/vue/${customer.id}`}
                />
            </div>
            <div className='d-flex flex-column gap-3 mt-5 ps-2'>
                <div className='d-flex align-items-center'>
                    <span className='icon-wrapper text-gray-600 me-3'>
                        <FontAwesomeIcon
                            icon={faPhone}
                            fontSize={16}
                        />
                    </span>
                    <span className='fw-medium'>{formatPhoneNumber(customer.user.phone_number)}</span>
                </div>
                <div className='d-flex align-items-center'>
                    <span className='icon-wrapper text-gray-600 me-3'>
                        <FontAwesomeIcon
                            icon={faEnvelope}
                            fontSize={16}
                        />
                    </span>
                    <span className='fw-medium'>{customer.user.email}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderCustomerDetails;
