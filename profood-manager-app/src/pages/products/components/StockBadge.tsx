import React from 'react';
import { Badge } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { SliceProps } from '../../../types';

/**
 * Stock indicator for a product. Reflects the API-computed stock_status, with
 * a fallback derived from stock_quantity when the accessor is absent.
 *
 * Untracked products (null stock) show a muted "Non suivi" instead of a badge.
 */
const StockBadge: React.FC<{ product: SliceProps }> = ({ product }) => {
    const { t } = useTranslation();

    const status = product.stock_status
        ?? (product.stock_quantity === null || product.stock_quantity === undefined ? 'untracked' : 'in_stock');
    const qty = product.stock_quantity;

    switch (status) {
        case 'out_of_stock':
            return (
                <Badge color='danger' className='bg-light-danger text-gray-800 fw-medium'>
                    <span>{t('Rupture')}{qty !== null && qty !== undefined ? ` (${qty})` : ''}</span>
                </Badge>
            );
        case 'low_stock':
            return (
                <Badge color='warning' className='bg-light-warning text-gray-800 fw-medium'>
                    <span>{t('Stock bas')} ({qty})</span>
                </Badge>
            );
        case 'in_stock':
            return (
                <Badge color='success' className='bg-light-success text-gray-800 fw-medium'>
                    <span>{t('En stock')} ({qty})</span>
                </Badge>
            );
        default:
            return <span className='text-muted fs-8'>{t('Non suivi')}</span>;
    }
};

export default StockBadge;
