import React from 'react';

import { Table } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { OrderProps } from '../../../types';
import { formatNumber } from '../../../helpers/AssetHelpers';
import NoOrderProduct from '../components/NoOrderProduct';

import './OrderProductDetails.css';

/**
 * 
 * @param order 
 * @returns 
 */
const OrderProductDetails: React.FC<OrderProps> = (order : OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     * @returns 
     */
    const slicesAmount = () => {
        let amount = 0;

        if(order !== undefined){
            order.cart.slices_data.map((e) => {
                return amount += Number((e.slice?.price ?? 0) * e.quantity);
            })
        }
        return formatNumber(amount);
    };

    /**
     * 
     */
    return (
        <div className='order-product-details-widget'>
        {
            (!order.cart.slices_data.length)
            ?
            <NoOrderProduct text={`${t('Aucun produit au détail pour cette commande')}.`} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='order-product-details-table table-card table-card-bordered w-100 fs-8 align-middle gy-4 bg-transparent'
            >
                <caption className='text-start px-2 pb-5'>
                    <h6 className='title-color font-md px-0'>{t('Au détail')}</h6>
                </caption>
                <thead>
                    <tr>
                        <th className='title-color font-sm fw-medium w-50px'>#</th>
                        <th className='title-color font-sm fw-medium w-225px'>{t('Produit')}</th>
                        <th className='title-color font-sm fw-medium w-110px'>{t('Prix')}</th>
                        <th className='title-color font-sm fw-medium w-90px'>{t('Quantité')}</th>
                        <th className='title-color font-sm fw-medium w-110px'>{t('Montant')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    order.cart.slices_data.map((slices_data, index) => {
                        return (
                            <tr key={index}>
                                <td className='content-color font-sm id-cell'>0{index + 1}</td>
                                <td className='content-color font-sm product-wording-cell'>
                                    <div className='d-flex'>
                                        {/* <div className='img-wrapper w-30px h-30px'>
                                            <img
                                                className="w-100"
                                                src={toAbsolutePublicUrl(`/media/images/illustrations/slices/${box_slice.slice.illustration}`)}
                                                alt='Illustration'
                                            />
                                        </div> */}
                                        <div>
                                            <span>{slices_data.slice ? t(slices_data.slice.wording) : t('Produit supprimé')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className='content-color font-sm product-price-cell'>
                                    <span>{formatNumber(slices_data.slice?.price ?? 0)}</span>
                                    <small className='ms-1'>Fcfa</small>
                                </td>
                                <td className='content-color font-sm product-quantity-cell'>{slices_data.quantity}</td>
                                <td className='content-color font-sm product-amount-cell'>
                                    <span>{formatNumber((slices_data.slice?.price ?? 0) * slices_data.quantity)}</span>
                                    <small className='ms-1'>Fcfa</small>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
                <tfoot>
                    <tr>
                        <td className='product-total-amount-text-cell' colSpan={4}>
                            <div className='d-flex align-items-center justify-content-end'>
                                <span className='title-color fs-7 fw-semibold'>Total :</span>
                            </div>
                        </td>
                        <td className='product-total-amount-value-cell'>
                            <div className='d-flex align-items-center justify-content-start'>
                                <span className='fs-7 fw-semibold'>
                                    <span>{slicesAmount()}</span>
                                    <small className='ms-1'>Fcfa</small>
                                </span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </Table>
        }
        </div>
    );
};

export default OrderProductDetails;
