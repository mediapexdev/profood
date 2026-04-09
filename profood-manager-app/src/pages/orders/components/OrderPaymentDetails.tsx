import React from 'react';

import { useTranslation } from 'react-i18next';

import { OrderProps } from '../../../types';
import { formatNumber } from '../../../helpers/AssetHelpers';

import './OrderPaymentDetails.css';

/**
 * 
 * @param order 
 * @returns 
 */
const OrderPaymentDetails: React.FC<OrderProps> = (order : OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='order-payment-details-widget'>
            <div className='d-flex flex-column gap-3 ps-0'>
                <div className='d-flex flex-stack gap-5'>
                    {/* <span className='icon-wrapper text-gray-600 me-0'>
                        <FontAwesomeIcon
                            icon={faPhone}
                            fontSize={16}
                        />
                    </span> */}
                    <span className='fs-8 fw-medium'>{t('Mode de paiement')}</span>
                    <span className='order-payment-method-label'>{t(order.payment_method)}</span>
                </div>
                <div className='d-flex flex-stack gap-5'>
                    {/* <span className='icon-wrapper text-gray-600 me-0'>
                        <FontAwesomeIcon
                            icon={faEnvelope}
                            fontSize={16}
                        />
                    </span> */}
                    <span className='fs-8 fw-medium'>{t('Montant')}</span>
                    <span className='order-amount-label fw-medium fs-7'>
                        <span>{formatNumber(order.montant)}</span>
                        <small className='ms-1'>Fcfa</small>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderPaymentDetails;
