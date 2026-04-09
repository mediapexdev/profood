import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Badge,
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoOrder from './NoOrder';
import useGoTo from '../../../components/hooks/useGoTo';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';
import CustomerChip from '../../customers/components/CustomerChip';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import { OrderPaymentStatus, OrderProps, OrderStatus } from '../../../types';
// import OrderEditModal from './modals/OrderEditModal';
// import OrderDeleteModal from './modals/OrderDeleteModal';
import OrderStatusUpdateModal from './modals/OrderStatusUpdateModal';
import OrderPaymentStatusUpdateModal from './modals/OrderPaymentStatusUpdateModal';

import "./OrdersList.css"

/**
 *
 */
interface OrdersListProps{
    orders: OrderProps[];
    fromSearch?: boolean;
    // Optional bulk-selection props. When omitted, checkboxes are not rendered
    // so the table looks identical to its pre-bulk-selection state.
    selectedOrders?: Set<number>;
    onToggleSelect?: (orderId: number) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const OrdersList: React.FC<OrdersListProps> = ({
    orders,
    fromSearch = false,
    selectedOrders,
    onToggleSelect
}: OrdersListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('ordersListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('ordersListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     *
     */
    const { pageData, pageCount } = usePagination(orders, curentPageNumber, rowsPerPage);

    /**
     *
     */
    useEffect(() => {
        if(curentPageNumber > pageCount){
            setCurrentPageNumber(pageCount);
        }
    }, [pageCount, curentPageNumber]);

    // --- Select-all for the current page ---
    // These are derived values so they never go stale: they recompute whenever
    // pageData or selectedOrders changes, with no additional state needed.
    const pageOrderIds = pageData.map(o => o.id);
    const allPageSelected = onToggleSelect !== undefined &&
        pageOrderIds.length > 0 &&
        pageOrderIds.every(id => selectedOrders?.has(id));
    const somePageSelected = onToggleSelect !== undefined &&
        pageOrderIds.some(id => selectedOrders?.has(id));

    const handleSelectAll = () => {
        if (!onToggleSelect) return;
        if (allPageSelected) {
            // Deselect all orders on the current page
            pageOrderIds.forEach(id => {
                if (selectedOrders?.has(id)) onToggleSelect(id);
            });
        } else {
            // Select all orders on the current page that are not yet selected
            pageOrderIds.forEach(id => {
                if (!selectedOrders?.has(id)) onToggleSelect(id);
            });
        }
    };

    /**
     * 
     */
    const [orderToEdit, setOrderToEdit] = useState<OrderProps|null>(null);
    const [orderToUpdatePaymentStatus, setOrderToUpdatePaymentStatus] = useState<OrderProps|null>(null);
    const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<OrderProps|null>(null);
    const [orderToDelete, setOrderToDelete] = useState<OrderProps|null>(null);
    const [showOrderEditModal, setShowOrderEditModal] = useState<boolean>(false);
    const [showOrderPaymentStatusUpdateModal, setShowOrderPaymentStatusUpdateModal] = useState<boolean>(false);
    const [showOrderStatusUpdateModal, setShowOrderStatusUpdateModal] = useState<boolean>(false);
    const [showOrderDeleteModal, setShowOrderDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleOrderEditModal = () => setShowOrderEditModal(!showOrderEditModal);

    /**
     * 
     * @returns 
     */
    const toggleOrderPaymentStatusUpdateModal = () => setShowOrderPaymentStatusUpdateModal(!showOrderPaymentStatusUpdateModal);

    /**
     * 
     * @returns 
     */
    const toggleOrderStatusUpdateModal = () => setShowOrderStatusUpdateModal(!showOrderStatusUpdateModal);

    /**
     * 
     * @returns 
     */
    const toggleOrderDeleteModal = () => setShowOrderDeleteModal(!showOrderDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedOrderEditModal = () => setOrderToEdit(null);

    /**
     * 
     * @returns 
     */
    const onClosedOrderPaymentStatusUpdateModal = () => setOrderToUpdatePaymentStatus(null);

    /**
     * 
     * @returns 
     */
    const onClosedOrderStatusUpdateModal = () => setOrderToUpdateStatus(null);

    /**
     * 
     * @returns 
     */
    const onClosedOrderDeleteModal = () => setOrderToDelete(null);

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div className='orders-list'>
        {
            (!pageData.length)
            ?
            <NoOrder fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='orders-table table-card table-card-bordered w-100 fs-8 align-middle table-cell-dashed gy-4 bg-transparent'
            >
                <thead>
                    <tr>
                        {/* Checkbox column — only rendered when bulk selection is enabled */}
                        {onToggleSelect && (
                            <th className='checkbox-col ps-4' style={{width: '40px'}}>
                                <input
                                    type="checkbox"
                                    checked={allPageSelected || false}
                                    // The indeterminate state communicates "some but not all
                                    // on this page are checked" without requiring a third
                                    // checked value in the boolean DOM attribute.
                                    ref={(el) => {
                                        if (el) el.indeterminate = !!(somePageSelected && !allPageSelected);
                                    }}
                                    onChange={handleSelectAll}
                                    style={{width: '16px', height: '16px', cursor: 'pointer'}}
                                />
                            </th>
                        )}
                        <th className='id ps-4'>{t('ID')}</th>
                        <th className='customer'>{t('Client(e)')}</th>
                        <th className='amount'>{t('Montant')}</th>
                        <th className='payment-status'>{t('Paiement')}</th>
                        {/* <th className='payment-method'>{t('Mode de paiement')}</th> */}
                        {/* <th className='address'>{t('Adresse')}</th> */}
                        <th className='status'>{t('Statut')}</th>
                        <th className='date-added'>{t("Date")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((order) => {
                        return (
                            <tr key={order.id}>
                                {/* Per-row checkbox — only rendered when bulk selection is active */}
                                {onToggleSelect && (
                                    <td className='checkbox-cell ps-4' style={{width: '40px'}}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders?.has(order.id) || false}
                                            onChange={() => onToggleSelect(order.id)}
                                            style={{width: '16px', height: '16px', cursor: 'pointer'}}
                                        />
                                    </td>
                                )}
                                <td className='id-cell ps-4'>
                                    <Link
                                        to={`/commandes/${order.string_id}`}
                                        className='link-info2 link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover'
                                    >
                                        <span className="fw-medium d-block">{order.string_id}</span>
                                    </Link>
                                </td>
                                <td className='customer-cell'>
                                    {order.customer ? (
                                        <CustomerChip
                                            customer={order.customer}
                                            url={`/clients/vue/${order.customer.id}`}
                                        />
                                    ) : (
                                        <div className='d-flex align-items-center gap-2'>
                                            <Badge className='bg-light-secondary text-secondary fw-medium fs-9'>
                                                {t('Invité')}
                                            </Badge>
                                            {order.guest_first_name && (
                                                <span className='fw-medium fs-8'>
                                                    {order.guest_first_name} {order.guest_last_name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className='amount-cell'>
                                    <span>{formatNumber(order.montant)}</span>
                                    <small className='ms-1'>Fcfa</small>
                                </td>
                                <td className='payment-status-cell'>
                                    {/* <div className='d-flex flex-row align-items-center gap-2'> */}
                                        <Badge
                                            className={`order-payment-status ${getFgAndBgByOrderPaymentStatus(order.payment_status)} ${getPaymentStatusClassName(order.payment_status)} fw-medium`}
                                            // color={`${getColorByOrderPaymentStatus(order.payment_status)}`}
                                        >
                                        {t(order.payment_status.wording)}
                                        </Badge>
                                        {/* <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='dark'
                                            className="d-inline-flex flex-center border-0 rounded-circle fs-8"
                                            onClick={() => {
                                                setOrderToUpdatePaymentStatus(order);
                                                setTimeout(() => setShowOrderPaymentStatusUpdateModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button> */}
                                    {/* </div> */}
                                </td>
                                {/* <td className='payment-method-cell'>{t(!order.payment_method ? 'Aucun' : order.payment_method)}</td> */}
                                {/* <td className='address-cell'>{order.address}</td> */}
                                <td className='status-cell'>
                                    {/* <div className='d-flex flex-row align-items-center gap-2'> */}
                                        <Badge
                                            className={`order-status ${getFgAndBgByOrderStatus(order.status)} fw-medium`}
                                            // color={getColorByOrderStatus(order.status)}
                                        >
                                        {t(order.status.wording)}
                                        </Badge>
                                        {/* <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='dark'
                                            className="d-inline-flex flex-center border-0 rounded-circle fs-8"
                                            onClick={() => {
                                                setOrderToUpdateStatus(order);
                                                setTimeout(() => setShowOrderStatusUpdateModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button> */}
                                    {/* </div> */}
                                </td>
                                <td className='date-cell'>{formatDate(new Date(order.created_at), 'long', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-view btn-view-order border-0'
                                            onClick={() => {
                                                goTo(`/commandes/${order.string_id}`)
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </Button>
                                        {/* <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='primary'
                                            className='btn-edit btn-edit-order border-0'
                                            onClick={() => {
                                                setOrderToEdit(order);
                                                setTimeout(() => setShowOrderEditModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button> */}
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-order border-0'
                                            onClick={() => {
                                                setOrderToDelete(order);
                                                setTimeout(() => setShowOrderDeleteModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </Table>
        }
            {/* begin::pagination */}
            <div className="pagination-box-wrapper mt-5">
                <Pagination
                    id='ordersListPagination'
                    pageCount={pageCount}
                    currentPageNumber={curentPageNumber}
                    setCurrentPageNumber={setCurrentPageNumber}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />
            </div>
            {/* end::pagination */}
            {/* begin::Modals */}
            {
                orderToUpdateStatus &&
                <OrderStatusUpdateModal
                    show={showOrderStatusUpdateModal}
                    setShow={setShowOrderStatusUpdateModal}
                    toggle={toggleOrderStatusUpdateModal}
                    onClosed={onClosedOrderStatusUpdateModal}
                    order={orderToUpdateStatus}
                />
            }
            {
                orderToUpdatePaymentStatus &&
                <OrderPaymentStatusUpdateModal
                    show={showOrderPaymentStatusUpdateModal}
                    setShow={setShowOrderPaymentStatusUpdateModal}
                    toggle={toggleOrderPaymentStatusUpdateModal}
                    onClosed={onClosedOrderPaymentStatusUpdateModal}
                    order={orderToUpdatePaymentStatus}
                />
            }
            {/* {
                orderToEdit &&
                <OrderEditModal
                    show={showOrderEditModal}
                    setShow={setShowOrderEditModal}
                    toggle={toggleOrderEditModal}
                    onClosed={onClosedOrderEditModal}
                    order={orderToEdit}
                />
            }
            {
                orderToDelete &&
                <OrderDeleteModal
                    show={showOrderDeleteModal}
                    setShow={setShowOrderDeleteModal}
                    toggle={toggleOrderDeleteModal}
                    onClosed={onClosedOrderDeleteModal}
                    order={orderToDelete}
                />
            } */}
            {/* end::Modals */}
        </div>
    );
};

export default OrdersList;

/**
 * 
 * @param paymentStatus 
 * @returns 
 */
export function getPaymentStatusClassName(paymentStatus: OrderPaymentStatus): string {

    switch(paymentStatus.code){
        case 8:
            return 'paid';
        case 16:
            return 'unpaid';
        default:
            return '';
    }
}

/**
 * 
 * @param paymentStatus 
 * @returns 
 */
export function getColorByOrderPaymentStatus(paymentStatus: OrderPaymentStatus): string {

    switch(paymentStatus.code){
        case 8:
            return 'success';
        case 16:
            return 'danger';
        case 32:
            return 'warning';
        default:
            return '';
    }
}

/**
 * 
 * @param status 
 * @returns 
 */
export function getColorByOrderStatus(status: OrderStatus): string {

    switch(status.code){
        case 8:
            return 'warning';
        case 16:
            return 'info2';
        case 32:
            return 'info';
        case 64:
            return 'success';
        case 80:
            return 'danger';
        default:
            return '';
    }
}

/**
 * 
 * @param paymentStatus 
 * @returns 
 */
export function getFgAndBgByOrderPaymentStatus(paymentStatus: OrderPaymentStatus): string {

    switch(paymentStatus.code){
        case 8:
            return 'bg-light-success text-success';
        case 16:
            return 'bg-light-danger text-danger';
        case 32:
            return 'bg-light-warning text-warning';
        default:
            return '';
    }
}

/**
 * 
 * @param status 
 * @returns 
 */
export function getFgAndBgByOrderStatus(status: OrderStatus): string {

    switch(status.code){
        case 8:
            return 'bg-light-warning text-warning';
        case 16:
            return 'bg-light-info2 text-info2';
        case 32:
            return 'bg-light-info text-info';
        case 64:
            return 'bg-light-success text-success';
        case 80:
            return 'bg-light-danger text-danger';
        default:
            return '';
    }
}
