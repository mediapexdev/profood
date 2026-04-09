import React, { useState } from 'react';

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Modal,
    ModalBody
} from 'reactstrap';
import {
    CheckLg
} from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import { OrderHistory, OrderProps, OrderStatus } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';
import api from '../../../api/api';
import useToast from '../../../components/hooks/useToast';
import { useLoadingSpinnerContext } from '../../../components/contexts/LoadingSpinnerProvider';
import { useUserInfosContext } from '../../account/components/contexts/UserInfosProvider';

import './OrderStatusesView.css'

/**
 * 
 * @param order 
 * @returns 
 */
const OrderStatusesView: React.FC<OrderProps> = (order: OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { orderStatuses, orderPaymentStatuses, fetchOrders } = useDataContext();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const { userPhoneNumber } = useUserInfosContext();

    /**
     * 
     */
    const [orderStatus, setOrderStatus] = useState<OrderStatus|undefined>(undefined);

    /**
     * 
     */
    const updateOrderStatus = () => {

        if(orderStatus === undefined) {
            showToast(`${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error', { autoClose: 2000 });
            return;
        }
        // showToast(`Ok ${orderStatus.wording}`, 'success', { autoClose: 2000 });
        // return
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "order_id": order.id,
            "status_id": orderStatus?.id,
            "manager_phone_number": userPhoneNumber
        };
        api.post('/update-order-status', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                setShowConfirmationModal(false);

                // Auto-update payment status when delivered + cash on delivery
                if(orderStatus?.code === 64
                    && order.payment_method === 'À la livraison'
                    && order.payment_status.code !== 8
                ) {
                    const paidStatus = orderPaymentStatuses.find((s) => s.code === 8);
                    if(paidStatus) {
                        api.post('/update-order-payment-status', {
                            order_id: order.id,
                            status_id: paidStatus.id,
                            manager_phone_number: userPhoneNumber
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        }).then((paymentRes) => {
                            if(paymentRes.status === 200 && paymentRes.data.message){
                                showToast(t('Statut de paiement de la commande mis à jour'), 'success', {autoClose: 2000});
                            }
                        }).catch(() => {
                            // Silent fail - manager can still update manually
                        });
                    }
                }

                fetchOrders(true, 3200);
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    };

    /**
     * 
     */
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const toggleConfirmationModal = () => setShowConfirmationModal(!showConfirmationModal);

    /**
     * 
     */
    return(
        <Card
            tag='div'
            id='orderStatusesView'
            className='rounded-1'
        >
            <CardHeader className='pt-4 pb-3'>
                <CardTitle
                    tag='h3'
                    className='fw-semibold mb-0'
                >
                    <span>
                    {t(order.status.wording.toLowerCase() !== 'delivered' &&
                        order.status.wording.toLowerCase() !== 'cancelled' ? 'Statut' : 'Historique')}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardBody className='py-8 py-sm-20'>
                <div className='d-flex flex-row flex-center'>
                    {/* begin::Stepper steps */}
                    <div
                        id='orderStatusesViewSteps'
                        className='d-flex flex-column flex-md-row justify-content-center position-relative'
                    >
                    {
                        order.status.wording.toLowerCase() === 'cancelled'
                        ?
                        order.histories.map((h, index) => {
                            return (
                                <div
                                    key={index}
                                    className='stepper-step-wrapper'
                                >
                                    {/* begin::Step content */}
                                    <div className='stepper-step-content d-flex flex-row flex-md-column align-items-center align-items-md-stretch justify-content-stretch justify-content-md-center gap-3 gap-md-2'>
                                        {/* begin::Stepper step */}
                                        <button
                                            type='button'
                                            className={`stepper-step ${h.status.wording.replaceAll(' ', '-').toLowerCase()} ${h.status.id === order.status.id ? 'active' : (h.status.id < order.status.id ? 'passed' : '')}`}
                                            aria-label={h.status.wording}
                                        >
                                            {/* begin::Step icon */}
                                            <div className='stepper-step-icon'>
                                            { (h.status.id === order.status.id || h.status.id < order.status.id) && <CheckLg size={16} /> }
                                            </div>
                                            {/* end::Step icon */}
                                        </button>
                                        {/* end::Stepper step */}
                                        <div className='stepper-step-title-and-date-wrapper d-flex flex-column gap-1 gap-md-2'>
                                            {/* begin::Step title */}
                                            <div className='stepper-step-title fw-medium lh-sm'>{t(h.status.wording)}</div>
                                            {/* end::Step title */}
                                            {/* begin::Step date */}
                                            {/* <div className='stepper-step-date fw-normal lh-sm text-muted'>{formatDate(new Date(order.created_at), 'long', undefined, true, 'short')}</div> */}
                                            <div className='stepper-step-date fw-normal lh-sm text-muted'>
                                            {
                                                (order.histories.length > 0 &&
                                                    (h.status.id === order.status.id || h.status.id < order.status.id)) &&
                                                getStatusDate(h.status, order.histories)
                                            }
                                            </div>
                                            {/* end::Step date */}
                                        </div>
                                    </div>
                                    {/* end::Step content */}
                                    {/* begin::Step line */}
                                    <div className='stepper-step-line d-block d-md-none'></div>
                                    {/* end::Step line */}
                                </div>
                            );
                        })
                        :
                        orderStatuses.slice(0, orderStatuses.length - 1).map((status, index) => {
                            return (
                                <div
                                    key={index}
                                    className='stepper-step-wrapper'
                                >
                                    {/* begin::Step content */}
                                    <div className='stepper-step-content d-flex flex-row flex-md-column align-items-center align-items-md-stretch justify-content-stretch justify-content-md-center gap-3 gap-md-2'>
                                        {/* begin::Stepper step */}
                                        <button
                                            type='button'
                                            className={`stepper-step ${status.wording.replaceAll(' ', '-').toLowerCase()} ${status.id === order.status.id ? 'active' : (status.id < order.status.id ? 'passed' : '')}`}
                                            aria-label={status.wording}
                                        >
                                            {/* begin::Step icon */}
                                            <div className='stepper-step-icon'>
                                            { (status.id === order.status.id || status.id < order.status.id) && <CheckLg size={16} /> }
                                            </div>
                                            {/* end::Step icon */}
                                        </button>
                                        {/* end::Stepper step */}
                                        <div className='stepper-step-title-and-date-wrapper d-flex flex-column gap-1 gap-md-2'>
                                            {/* begin::Step title */}
                                            <div className='stepper-step-title fw-medium lh-sm'>{t(status.wording)}</div>
                                            {/* end::Step title */}
                                            {/* begin::Step date */}
                                            {/* <div className='stepper-step-date fw-normal lh-sm text-muted'>{formatDate(new Date(order.created_at), 'long', undefined, true, 'short')}</div> */}
                                            <div className='stepper-step-date fw-normal lh-sm text-muted'>
                                            {
                                                (order.histories.length > 0 &&
                                                    (status.id === order.status.id || status.id < order.status.id)) &&
                                                getStatusDate(status, order.histories)
                                            }
                                            </div>
                                            {/* end::Step date */}
                                        </div>
                                    </div>
                                    {/* end::Step content */}
                                    {/* begin::Step line */}
                                    <div className='stepper-step-line d-block d-md-none'></div>
                                    {/* end::Step line */}
                                </div>
                            );
                        })
                    }
                    </div>
                    {/* end::Stepper content */}
                </div>
            </CardBody>
            {
                order.status.wording.toLowerCase() !== 'delivered' && 
                order.status.wording.toLowerCase() !== 'cancelled' && 
                <CardFooter className='p-4 pb-6 border-0'>
                    <div className='d-flex flex-center'>
                        <Button
                            tag='button'
                            type='button'
                            size='sm'
                            // color='success'
                            id='btnStatusHandler'
                            className='border-0 rounded-1 py-2 px-8'
                            onClick={() => {
                                setOrderStatus(getNextStatus(order.status, orderStatuses));
                                setShowConfirmationModal(true);
                            }}
                        >
                            <span>{t(getNextStatus(order.status, orderStatuses)?.wording as string)}</span>
                        </Button>
                    </div>
                </CardFooter>
            }
            {/* begin::Modal */}
            <Modal
                id='orderStatusChangeConfirmationModal'
                className='confirmation-modal'
                isOpen={showConfirmationModal}
                toggle={toggleConfirmationModal}
                size='sm'
                backdrop='static'
                centered={true}
            >
                <ModalBody className='border-0 py-6 px-10 flex-center'>
                    <div className='d-flex flex-row flex-center gap-2 w-100'>
                        <Button
                            tag='button'
                            type='button'
                            outline={true}
                            className='border-0 rounded-1 w-110px'
                            onClick={() => {
                                setOrderStatus(undefined);
                                setShowConfirmationModal(false);
                            }}
                        >
                            <span>{t('Annuler')}</span>
                        </Button>
                        <Button
                            tag='button'
                            type='button'
                            color='success'
                            className='border-0 rounded-1 w-110px'
                            onClick={updateOrderStatus}
                        >
                            <span>{t('Confirmer')}</span>
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
            {/* end::Modal */}
        </Card>
    );
};

/**
 * 
 * @param status 
 * @param statuses 
 * @returns 
 */
function getNextStatus(status: OrderStatus, statuses: OrderStatus[]): OrderStatus|undefined {

    switch (status.code) {
        case 8:
            return statuses.find((s) => s.code === 16);
        case 16:
            return statuses.find((s) => s.code === 32);
        case 32:
            return statuses.find((s) => s.code === 64);
        default:
            return status
    }
}

/**
 * 
 * @param status 
 * @param histories 
 * @returns 
 */
function getStatusDate(status: OrderStatus, histories: OrderHistory[]): string|null {

    const s = histories.find((h) => h.status.id === status.id);
    return s === undefined ? null : formatDate(new Date(s.created_at), 'long', undefined, true, 'short');
}

export default OrderStatusesView;
