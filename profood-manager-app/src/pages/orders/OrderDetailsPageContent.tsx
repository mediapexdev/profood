import React, { useState } from "react";

import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Col,
    Container,
    Modal,
    ModalBody,
    Row
} from "reactstrap";

import { ArrowLeft } from "react-bootstrap-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFileInvoice, faLocationDot, faPhone, faPrint, faUser } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import { OrderProps } from "../../types";
import { formatDate, formatPhoneNumber } from "../../helpers/AssetHelpers";
import useGoTo from "../../components/hooks/useGoTo";
import OrderBoxDetails from "./components/OrderBoxDetails";
import OrderProductDetails from "./components/OrderProductDetails";
import OrderCustomerDetails from "./components/OrderCustomerDetails";
import OrderPaymentDetails from "./components/OrderPaymentDetails";
import OrderDeliveryAddressDetails from "./components/OrderDeliveryAddressDetails";
import OrderStatusesView from "./components/OrderStatusesView";
import { useDataContext } from "../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../components/contexts/LoadingSpinnerProvider";
import { useUserInfosContext } from "../account/components/contexts/UserInfosProvider";
import useToast from "../../components/hooks/useToast";
import api from "../../api/api";

import './OrderDetailsPageContent.css';

/**
 * 
 * @param order 
 * @returns 
 */
const OrderDetailsPageContent: React.FC<OrderProps> = (order: OrderProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { fetchOrders, orderPaymentStatuses, orderStatuses } = useDataContext();

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
     * @returns 
     */
    const cancelOrder = () => {

        const orderStatus = orderStatuses.find((s) => s.wording.toLowerCase() === 'cancelled');

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
                fetchOrders(true, 3200);
                setShowOrderCancellationConfirmationModal(false);
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
     * @returns 
     */
    const confirmPayment = () => {

        const paymentStatus = orderPaymentStatuses.find((s) => s.code === 8);

        if(paymentStatus === undefined) {
            showToast(`${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error', { autoClose: 2000 });
            return;
        }
        // showToast(`Ok ${orderStatus.wording}`, 'success', { autoClose: 2000 });
        // return
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "order_id": order.id,
            "status_id": paymentStatus?.id,
            "manager_phone_number": userPhoneNumber
        };
        api.post('/update-order-payment-status', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                fetchOrders(true, 3200);
                setShowOrderPaymentConfirmationModal(false);
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
    const [showOrderCancellationConfirmationModal, setShowOrderCancellationConfirmationModal] = useState<boolean>(false);
    const toggleOrderCancellationConfirmationModal = () => setShowOrderCancellationConfirmationModal(!showOrderCancellationConfirmationModal);

    /**
     * 
     */
    const [showOrderPaymentConfirmationModal, setShowOrderPaymentConfirmationModal] = useState<boolean>(false);
    const toggleOrderPaymentConfirmationModal = () => setShowOrderPaymentConfirmationModal(!showOrderPaymentConfirmationModal);

    /**
     * 
     */
    return (
        <div
            id="orderDetailsPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-4">
                    {/*  */}
                    <Col xs={12}>
                        <Card className='border-0 rounded-1'>
                            <CardBody>
                                <div className='d-flex flex-row flex-wrap flex-stack'>
                                    <div className='d-flex align-items-center'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            title={t('Retour')}
                                            color='light'
                                            className="d-flex flex-center gap-1 h-40px"
                                            onClick={() => goTo('/commandes')}
                                        >
                                            <ArrowLeft />
                                        </Button>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                    {
                                        order.status.wording.toLowerCase() !== 'delivered' &&
                                        order.status.wording.toLowerCase() !== 'cancelled' &&
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='none'
                                            className="border-0 rounded-1 bs-bg-hover-light-danger text-danger"
                                            onClick={() => setShowOrderCancellationConfirmationModal(true)}
                                        >
                                            <span>{t('Annuler la commande')}</span>
                                        </Button>
                                    }
                                    {
                                        order.payment_status.code !== 8 &&
                                        order.status.wording.toLowerCase() !== 'cancelled' &&
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='success'
                                            className="rounded-1"
                                            onClick={() => setShowOrderPaymentConfirmationModal(true)}
                                        >
                                            <span>{t('Définir comme payée')}</span>
                                        </Button>
                                    }
                                    {
                                        order.payment_status.code === 8 &&
                                        order.status.wording.toLowerCase() === 'delivered' &&
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='success'
                                            className="rounded-1"
                                            onClick={() => goTo(`/commandes/${order.string_id}/facture`)}
                                        >
                                            <span className="icon-wrapper me-2">
                                                <FontAwesomeIcon icon={faFileInvoice} />
                                            </span>
                                            <span>{t('Facture')}</span>
                                        </Button>
                                    }
                                    <Button
                                        tag='button'
                                        type='button'
                                        color='light'
                                        className="rounded-1"
                                        onClick={() => goTo(`/commandes/${order.string_id}/recu`)}
                                    >
                                        <span className="icon-wrapper me-2">
                                            <FontAwesomeIcon icon={faPrint} />
                                        </span>
                                        <span>{t('Reçu')}</span>
                                    </Button>
                                    </div>
                                </div>
                            </CardBody>
                            {/* begin::Modal */}
                            <Modal
                                id='orderCancellationConfirmationModal'
                                className='confirmation-modal'
                                isOpen={showOrderCancellationConfirmationModal}
                                toggle={toggleOrderCancellationConfirmationModal}
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
                                                setShowOrderCancellationConfirmationModal(false);
                                            }}
                                        >
                                            <span>{t('Annuler')}</span>
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='danger'
                                            className='border-0 rounded-1 w-110px'
                                            onClick={cancelOrder}
                                        >
                                            <span>{t('Confirmer')}</span>
                                        </Button>
                                    </div>
                                </ModalBody>
                            </Modal>
                            {/* end::Modal */}
                            {/* begin::Modal */}
                            <Modal
                                id='orderPaymentConfirmationModal'
                                className='confirmation-modal'
                                isOpen={showOrderPaymentConfirmationModal}
                                toggle={toggleOrderPaymentConfirmationModal}
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
                                                setShowOrderPaymentConfirmationModal(false);
                                            }}
                                        >
                                            <span>{t('Annuler')}</span>
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='success'
                                            className='border-0 rounded-1 w-110px'
                                            onClick={confirmPayment}
                                        >
                                            <span>{t('Confirmer')}</span>
                                        </Button>
                                    </div>
                                </ModalBody>
                            </Modal>
                            {/* end::Modal */}
                        </Card>
                    </Col>
                    {/*  */}
                    {/*  */}
                    <Col xs={12} xl={8}>
                        <Card className='order-box-details-view rounded-1'>
                            <CardHeader className='pt-5 pb-3 border-0'>
                                <div className='d-flex flex-row flex-stack'>
                                    <CardTitle
                                        tag='h3'
                                        className='fw-semibold'
                                    >
                                        <span>{`${t('Commande')} n° ${order.string_id}`}</span>
                                    </CardTitle>
                                    <CardSubtitle className="fw-medium">
                                        <span>{formatDate(new Date(order.created_at), 'full', '-', true, 'short')}</span>
                                    </CardSubtitle>
                                </div>
                            </CardHeader>
                            <CardBody className='px-0'>
                                <div className='order-box-details-wrapper'>
                                    <OrderBoxDetails {...order} />
                                </div>
                                <div className='order-product-details-wrapper mt-5'>
                                    <OrderProductDetails {...order} />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    {/*  */}
                    {/*  */}
                    <Col xs={12} xl={4}>
                        <Row className="gy-4">
                            {/* begin::Order customer details */}
                            <Col xs={12}>
                                <Card className='order-customer-details-view rounded-1'>
                                    <CardHeader className='pt-4 pb-3'>
                                        <div className='d-flex flex-stack'>
                                            <div className='d-flex align-items-center'>
                                                <span className="icon-wrapper text-gray-600 me-3">
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        fontSize={16}
                                                    />
                                                </span>
                                                <CardTitle
                                                    tag='h3'
                                                    className='fw-semibold mb-0'
                                                >
                                                    <span>{t('Client(e)')}</span>
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        {order.customer ? (
                                            <OrderCustomerDetails {...order.customer} />
                                        ) : (
                                            <div className='order-customer-details-widget'>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <Badge className='bg-light-secondary text-secondary fw-medium'>
                                                        {t('Invité')}
                                                    </Badge>
                                                    {order.guest_first_name && (
                                                        <span className='fw-semibold'>
                                                            {order.guest_first_name} {order.guest_last_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='d-flex flex-column gap-3 mt-5 ps-2'>
                                                    {order.guest_phone_number && (
                                                        <div className='d-flex align-items-center'>
                                                            <span className='icon-wrapper text-gray-600 me-3'>
                                                                <FontAwesomeIcon icon={faPhone} fontSize={16} />
                                                            </span>
                                                            <span className='fw-medium'>{formatPhoneNumber(order.guest_phone_number)}</span>
                                                        </div>
                                                    )}
                                                    {order.guest_email && (
                                                        <div className='d-flex align-items-center'>
                                                            <span className='icon-wrapper text-gray-600 me-3'>
                                                                <FontAwesomeIcon icon={faEnvelope} fontSize={16} />
                                                            </span>
                                                            <span className='fw-medium'>{order.guest_email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            {/* end::Order customer details */}
                            {/* begin::Order payment details */}
                            <Col xs={12}>
                                <Card className='order-payment-details-view rounded-1'>
                                    <CardHeader className='pt-4 pb-3'>
                                        <div className='d-flex align-items-center'>
                                            <span className="icon-wrapper text-gray-600 me-3">
                                                <FontAwesomeIcon
                                                    icon={faCreditCard}
                                                    fontSize={16}
                                                />
                                            </span>
                                            <CardTitle
                                                tag='h3'
                                                className='fw-semibold mb-0'
                                            >
                                                <span>{t('Détails de paiement')}</span>
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <OrderPaymentDetails {...order} />
                                    </CardBody>
                                </Card>
                            </Col>
                            {/* end::Order payment details */}
                            {/* begin::Order delivery address */}
                            <Col xs={12}>
                                <Card className='order-delivery-address-details-view rounded-1'>
                                    <CardHeader className='pt-4 pb-3'>
                                        <div className='d-flex align-items-center'>
                                            <span className="icon-wrapper text-gray-600 me-3">
                                                <FontAwesomeIcon
                                                    icon={faLocationDot}
                                                    fontSize={16}
                                                />
                                            </span>
                                            <CardTitle
                                                tag='h3'
                                                className='fw-semibold mb-0'
                                            >
                                                <span>{t('Adresse de livraison')}</span>
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <OrderDeliveryAddressDetails {...order} />
                                    </CardBody>
                                </Card>
                            </Col>
                            {/* end::Order delivery address */}
                        </Row>
                    </Col>
                    {/*  */}
                    {/* begin::Status view */}
                    <Col xs={12}>
                        <OrderStatusesView {...order} />
                    </Col>
                    {/* end::Status view  */}
                </Row>
            </Container>
        </div>
    );
};

export default OrderDetailsPageContent;
