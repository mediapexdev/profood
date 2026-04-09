import React from 'react';

import { OrderProps } from '../../../types';

import './OrderDeliveryAddressDetails.css';

/**
 * 
 * @param order 
 * @returns 
 */
const OrderDeliveryAddressDetails: React.FC<OrderProps> = (order : OrderProps) => {
    /**
     * 
     */
    return (
        <div className='order-delivery-address-details-widget'>
            <div className='d-flex flex-column gap-3 ps-0'>
                <div className='d-flex flex-stack gap-5'>
                    {/* <span className='icon-wrapper text-gray-600 me-0'>
                        <FontAwesomeIcon
                            icon={faPhone}
                            fontSize={16}
                        />
                    </span> */}
                    <span className='order-delivery-address-label fw-medium'>{order.address}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderDeliveryAddressDetails;
