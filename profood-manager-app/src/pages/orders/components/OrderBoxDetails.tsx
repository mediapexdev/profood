import React from 'react';

import { Table } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { OrderProps } from '../../../types';
import { formatNumber } from '../../../helpers/AssetHelpers';
import NoOrderProduct from '../components/NoOrderProduct';

import './OrderBoxDetails.css';

/**
 * 
 * @param order 
 * @returns 
 */
const OrderBoxDetails: React.FC<OrderProps> = (order : OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     * @returns 
     */
    const boxesAmount = () => {
        let amount = 0;

        if(order !== undefined){
            order.cart.boxes_data.map((e) => {
                return amount += Number(e.type?.price ?? 0);
            })
        }
        return formatNumber(amount);
    };

    /**
     * 
     */
    return (
        <div className='order-box-details-widget'>
        {
            (!order.cart.boxes_data.length)
            ?
            <NoOrderProduct text={`${t('Aucun Box pour cette commande')}.`} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='order-box-details-table table-card table-card-bordered w-100 fs-8 align-middle gy-4 bg-transparent'
            >
                <caption className='text-start px-2 pb-5'>
                    <h6 className='title-color font-md px-0'>Profood Box</h6>
                </caption>
                <thead>
                    <tr>
                        <th className='title-color font-sm fw-medium w-50px'>#</th>
                        <th className='title-color font-sm fw-medium w-150px'>{t('Box')}</th>
                        <th className='title-color font-sm fw-medium w-90px'>{t('Capacité')}</th>
                        <th className='title-color font-sm fw-medium w-225px'>{t('Produits')}</th>
                        <th className='title-color font-sm fw-medium w-110px'>{t('Prix')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    order.cart.boxes_data.map((box_data, index) => {
                        return (
                            <tr key={index}>
                                <td className='content-color font-sm id-cell'>0{index + 1}</td>
                                <td className='content-color font-sm box-name-cell'>{box_data.type?.wording ?? t('Produit supprimé')}</td>
                                <td className='content-color font-sm box-quantity-cell'>{box_data.type?.capacity ?? '—'}</td>
                                <td className='content-color font-sm box-products-cell'>
                                    <div className='d-flex flex-column'>
                                    {
                                        box_data.box_slices.map((box_slice, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className='d-flex'
                                                >
                                                    {/* <div className='img-wrapper w-30px h-30px'>
                                                        <img
                                                            className="w-100"
                                                            src={toAbsolutePublicUrl(`/media/images/illustrations/slices/${box_slice.slice.illustration}`)}
                                                            alt='Illustration'
                                                        />
                                                    </div> */}
                                                    <div>
                                                        <small className='me-1'>{`x${box_slice.quantity}`}</small>
                                                        <span>{box_slice.slice ? `${t(box_slice.slice.wording)}` : t('Produit supprimé')}</span>
                                                        {/* <span>{`${t(box_slice.slice.wording)} (x${box_slice.quantity})`}</span> */}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                    </div>
                                </td>
                                <td className='content-color font-sm box-price-cell'>
                                    <span>{formatNumber(box_data.type?.price ?? 0)}</span>
                                    <small className='ms-1'>Fcfa</small>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
                <tfoot>
                    <tr>
                        <td className='box-total-amount-text-cell' colSpan={4}>
                            <div className='d-flex align-items-center justify-content-end'>
                                <span className='title-color fs-7 fw-semibold'>Total :</span>
                            </div>
                        </td>
                        <td className='box-total-amount-value-cell'>
                            <div className='d-flex align-items-center justify-content-start'>
                                <span className='fs-7 fw-semibold'>
                                    <span>{boxesAmount()}</span>
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

export default OrderBoxDetails;
