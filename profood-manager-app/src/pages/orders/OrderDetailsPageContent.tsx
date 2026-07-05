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

import Select from "react-select";

import { ArrowLeft } from "react-bootstrap-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFileInvoice, faLocationDot, faPhone, faPrint, faTruck, faUser } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import { Livreur, OrderProps } from "../../types";
import { formatDate, formatPhoneNumber } from "../../helpers/AssetHelpers";
import useGoTo from "../../components/hooks/useGoTo";
import OrderBoxDetails from "./components/OrderBoxDetails";
import OrderProductDetails from "./components/OrderProductDetails";
import OrderCustomerDetails from "./components/OrderCustomerDetails";
import OrderPaymentDetails from "./components/OrderPaymentDetails";
import OrderDeliveryAddressDetails from "./components/OrderDeliveryAddressDetails";
import OrderStatusesView from "./components/OrderStatusesView";
import OrderRefundsView from "./components/OrderRefundsView";
import OrderEditModal from "./components/modals/OrderEditModal";
import RefundModal from "./components/modals/RefundModal";
import LivreurLiveLocation from "./components/LivreurLiveLocation";
import { useDataContext } from "../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../components/contexts/LoadingSpinnerProvider";
import { useUserInfosContext } from "../account/components/contexts/UserInfosProvider";
import useToast from "../../components/hooks/useToast";
import api from "../../api/api";
import {
    customSelectClearIndicator,
    customSelectControl,
    customSelectDropdownIndicator,
    customSelectMenu,
    customSelectMenuList,
    customSelectOption,
    customSelectPlaceholder,
    customSelectStyles,
    customSelectValueConatiner
} from "../../components/others/select-customizer";

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
    const { fetchOrders, orderPaymentStatuses, orderStatuses, livreurs } = useDataContext();

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
    const { userPhoneNumber, userRole } = useUserInfosContext();

    /**
     * Whether the current user may assign / unassign livreurs.
     * Managers (16), Admins (32) and Super Admins (64) are allowed.
     */
    const canAssignLivreur = userRole !== undefined && (
        userRole.code === 16 || userRole.code === 32 || userRole.code === 64
    );

    /**
     * Assign or unassign a livreur for the current order.
     *
     * @param livreurId  The id of the Livreur to assign, or null to unassign.
     */
    const assignLivreur = (livreurId: number | null) => {
        const token = localStorage.getItem('token');
        setShowSpinner(true);
        api.post(
            '/assign-livreur-to-order',
            { order_id: order.id, livreur_id: livreurId },
            { headers: { Authorization: `Bearer ${token}` } }
        ).then((res) => {
            if (res.status === 200) {
                const msg = livreurId === null
                    ? t('Livreur désassigné avec succès')
                    : t('Livreur assigné avec succès');
                showToast(msg, 'success', { autoClose: 2000 });
                // Reload orders so the livreur field reflects the new assignment
                fetchOrders(true, 1500);
            } else {
                setShowSpinner(false);
                showToast(
                    res.data.message
                        ? t(res.data.message)
                        : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`,
                    'error'
                );
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(
                error.response?.data?.message
                    ? t(error.response.data.message)
                    : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`,
                'error'
            );
            console.dir(error);
        });
    };

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
     * Edit-details and refund modals.
     */
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const toggleEditModal = () => setShowEditModal((prev) => !prev);
    const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
    const toggleRefundModal = () => setShowRefundModal((prev) => !prev);

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
                                        order.status.wording.toLowerCase() !== 'cancelled' &&
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='none'
                                            className="border-0 rounded-1 bs-bg-hover-light-info text-gray-700"
                                            onClick={() => setShowEditModal(true)}
                                        >
                                            <span>{t('Modifier')}</span>
                                        </Button>
                                    }
                                    {
                                        order.payment_status.code === 8 &&
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='none'
                                            className="border-0 rounded-1 bs-bg-hover-light-warning text-warning"
                                            onClick={() => setShowRefundModal(true)}
                                        >
                                            <span>{t('Rembourser')}</span>
                                        </Button>
                                    }
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
                            {/* begin::Order livreur */}
                            <Col xs={12}>
                                <Card className='order-livreur-details-view rounded-1'>
                                    <CardHeader className='pt-4 pb-3'>
                                        <div className='d-flex align-items-center'>
                                            <span className="icon-wrapper text-gray-600 me-3">
                                                <FontAwesomeIcon
                                                    icon={faTruck}
                                                    fontSize={16}
                                                />
                                            </span>
                                            <CardTitle
                                                tag='h3'
                                                className='fw-semibold mb-0'
                                            >
                                                <span>{t('Livraison')}</span>
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        {/* Current assignment display — visible to all roles */}
                                        <div className='mb-4'>
                                            {order.livreur ? (
                                                <div className='d-flex flex-column gap-2'>
                                                    <span className='fw-semibold'>
                                                        {order.livreur.user.first_name} {order.livreur.user.last_name}
                                                    </span>
                                                    <div className='d-flex align-items-center'>
                                                        <span className='icon-wrapper text-gray-600 me-2'>
                                                            <FontAwesomeIcon icon={faPhone} fontSize={14} />
                                                        </span>
                                                        <span className='fw-medium'>
                                                            {formatPhoneNumber(order.livreur.user.phone_number)}
                                                        </span>
                                                    </div>
                                                    <LivreurLiveLocation livreurId={order.livreur.id} />
                                                </div>
                                            ) : (
                                                <Badge className='bg-light-secondary text-secondary fw-medium'>
                                                    {t('Aucun livreur assigné')}
                                                </Badge>
                                            )}
                                        </div>
                                        {/* Assignment controls — only for MANAGER / ADMIN / SUPER_ADMIN */}
                                        {canAssignLivreur && (
                                            <div className='d-flex flex-column gap-3'>
                                                {/*
                                                 * The shared custom-select components use generic `unknown` typings,
                                                 * so we intentionally pass them without a typed generic and handle
                                                 * the typed value via a cast in onChange — consistent with the
                                                 * pattern used throughout the codebase (e.g. NewUserFormView).
                                                 */}
                                                <Select
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    components={{
                                                        Control: customSelectControl,
                                                        ClearIndicator: customSelectClearIndicator,
                                                        DropdownIndicator: customSelectDropdownIndicator,
                                                        Menu: customSelectMenu,
                                                        MenuList: customSelectMenuList,
                                                        Option: customSelectOption,
                                                        Placeholder: customSelectPlaceholder,
                                                        ValueContainer: customSelectValueConatiner
                                                    } as any}
                                                    isClearable={false}
                                                    isSearchable={true}
                                                    menuPlacement='auto'
                                                    menuPortalTarget={document.body}
                                                    name='livreur'
                                                    options={livreurs}
                                                    getOptionLabel={(l: Livreur) =>
                                                        `${l.user.first_name} ${l.user.last_name} (${formatPhoneNumber(l.user.phone_number)})`
                                                    }
                                                    getOptionValue={(l: Livreur) => String(l.id)}
                                                    value={
                                                        order.livreur
                                                            ? livreurs.find(l => l.id === order.livreur!.id) ?? null
                                                            : null
                                                    }
                                                    placeholder={t('Assigner un livreur')}
                                                    styles={customSelectStyles}
                                                    onChange={(selected: Livreur | null) => {
                                                        if (selected) {
                                                            assignLivreur(selected.id);
                                                        }
                                                    }}
                                                />
                                                {order.livreur && (
                                                    <Button
                                                        tag='button'
                                                        type='button'
                                                        color='none'
                                                        outline={true}
                                                        size='sm'
                                                        className='border rounded-1 text-danger border-danger align-self-start'
                                                        onClick={() => assignLivreur(null)}
                                                    >
                                                        <span>{t('Désassigner')}</span>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            {/* end::Order livreur */}
                        </Row>
                    </Col>
                    {/*  */}
                    {/* begin::Status view */}
                    <Col xs={12}>
                        <OrderStatusesView {...order} />
                    </Col>
                    {/* end::Status view  */}
                    {/* begin::Refunds */}
                    <Col xs={12}>
                        <OrderRefundsView order={order} />
                    </Col>
                    {/* end::Refunds */}
                </Row>
            </Container>

            {showEditModal && (
                <OrderEditModal show={showEditModal} setShow={setShowEditModal} toggle={toggleEditModal} order={order} />
            )}
            {showRefundModal && (
                <RefundModal show={showRefundModal} setShow={setShowRefundModal} toggle={toggleRefundModal} order={order} />
            )}
        </div>
    );
};

export default OrderDetailsPageContent;
