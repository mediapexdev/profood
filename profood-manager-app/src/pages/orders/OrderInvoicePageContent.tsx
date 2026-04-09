import React from "react";

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Container,
    Row
} from "reactstrap";

import { ArrowLeft } from "react-bootstrap-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import { OrderProps } from "../../types";
import { formatDate, formatNumber, formatPhoneNumber, toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import useGoTo from "../../components/hooks/useGoTo";
import OrderBoxDetails from "./components/OrderBoxDetails";
import OrderProductDetails from "./components/OrderProductDetails";

import './OrderInvoicePageContent.css';

/**
 *
 * @param order
 * @returns
 */
const OrderInvoicePageContent: React.FC<OrderProps> = (order: OrderProps) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const goTo = useGoTo();

    /**
     * Calculate subtotals
     */
    const boxesSubtotal = order.cart.boxes_data.reduce((sum, box) => sum + Number(box.type.price), 0);
    const slicesSubtotal = order.cart.slices_data.reduce((sum, cs) => sum + (Number(cs.slice.price) * cs.quantity), 0);
    const subtotal = boxesSubtotal + slicesSubtotal;
    const discount = order.discount_amount ?? 0;

    /**
     *
     */
    return (
        <div
            id="orderInvoicePageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-4">
                    {/* Toolbar */}
                    <Col xs={12} className="no-printable">
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
                                            onClick={() => goTo(`/commandes/${order.string_id}`)}
                                        >
                                            <ArrowLeft />
                                        </Button>
                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='success'
                                            className="rounded-1"
                                            onClick={() => { window.print(); }}
                                        >
                                            <span className="icon-wrapper me-2">
                                                <FontAwesomeIcon icon={faPrint} />
                                            </span>
                                            <span>{t('Imprimer')}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Invoice card */}
                    <Col xs={12}>
                        <Card className="invoice order-invoice">
                            {/* Header: Logo + Invoice title + reference */}
                            <CardHeader className="invoice-header p-4 pt-5 pb-4">
                                <div className="d-flex flex-stack align-items-start">
                                    <div className="d-flex flex-column">
                                        <h2 className="invoice-title mb-2">{t('Facture')}</h2>
                                        <div className="d-flex flex-column gap-1">
                                            <div className="invoice-meta-item">
                                                <span className="invoice-meta-label">{t('Référence')}:</span>
                                                <span className="invoice-meta-value fw-semibold">FAC-{order.string_id}</span>
                                            </div>
                                            <div className="invoice-meta-item">
                                                <span className="invoice-meta-label">{t("Date d'émission")}:</span>
                                                <span className="invoice-meta-value">{formatDate(new Date(order.created_at), 'long', '-')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='invoice-logo-wrapper'>
                                        <img
                                            src={toAbsolutePublicUrl('/assets/media/images/logos/profood-new.png')}
                                            className="img-fluid"
                                            alt='Logo Profood'
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Addresses: Client + Company */}
                            <CardHeader className="invoice-addresses p-4 pt-4 pb-4">
                                <Row>
                                    {/* Billed to */}
                                    <Col xs={12} md={6}>
                                        <div className="invoice-address-block">
                                            <h6 className="invoice-address-title">{t('Facturé à')}</h6>
                                            <div className="invoice-address-content">
                                                <p className="fw-semibold mb-1">
                                                    {order.customer
                                                        ? `${order.customer.user.first_name} ${order.customer.user.last_name}`
                                                        : order.guest_first_name
                                                            ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`
                                                            : t('Invité')
                                                    }
                                                </p>
                                                {(order.customer?.user?.phone_number || order.guest_phone_number) && (
                                                    <p className="mb-0">
                                                        {formatPhoneNumber(order.customer?.user?.phone_number ?? order.guest_phone_number ?? '')}
                                                    </p>
                                                )}
                                                {(order.customer?.user?.email || order.guest_email) && (
                                                    <p className="mb-0">
                                                        {order.customer?.user?.email ?? order.guest_email}
                                                    </p>
                                                )}
                                                {order.address && (
                                                    <p className="mb-0">{order.address}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                    {/* From */}
                                    <Col xs={12} md={6}>
                                        <div className="invoice-address-block invoice-address-right">
                                            <h6 className="invoice-address-title">Profood</h6>
                                            <div className="invoice-address-content">
                                                <p className="mb-0">Lot 44, Route des Mamelles</p>
                                                <p className="mb-0">Dakar, Sénégal</p>
                                                <p className="mb-0">+221 77 856 89 89</p>
                                                <p className="mb-0">contact@profood.sn</p>
                                                <p className="mb-0">
                                                    <a
                                                        href="https://www.profood.sn/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="invoice-link"
                                                    >
                                                        www.profood.sn
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </CardHeader>

                            {/* Items */}
                            <CardBody className="invoice-items-body p-4">
                                {order.cart.boxes_data.length > 0 && (
                                    <div className="invoice-table-wrapper mb-3">
                                        <OrderBoxDetails {...order} />
                                    </div>
                                )}

                                {order.cart.slices_data.length > 0 && (
                                    <div className="invoice-table-wrapper">
                                        <OrderProductDetails {...order} />
                                    </div>
                                )}
                            </CardBody>

                            {/* Footer: Payment + Totals */}
                            <CardFooter className="invoice-footer p-4 pb-5">
                                <Row>
                                    {/* Payment details */}
                                    <Col xs={12} md={5}>
                                        <div className="invoice-payment-block">
                                            <h6 className="invoice-section-title mb-3">{t('Détails de paiement')}</h6>
                                            <div className="d-flex flex-column gap-2">
                                                <div className="invoice-payment-row">
                                                    <span className="invoice-payment-label">{t('Mode de paiement')}</span>
                                                    <span className="invoice-payment-value">{t(order.payment_method)}</span>
                                                </div>
                                                <div className="invoice-payment-row">
                                                    <span className="invoice-payment-label">{t('Statut')}</span>
                                                    <span className="invoice-payment-value">{t(order.payment_status.wording)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Totals */}
                                    <Col xs={12} md={{ size: 5, offset: 2 }}>
                                        <div className="invoice-totals-block">
                                            <h6 className="invoice-section-title mb-3">{t('Récapitulatif')}</h6>
                                            <div className="invoice-totals-table">
                                                <div className="invoice-totals-row">
                                                    <span className="invoice-totals-label">{t('Sous-total')}</span>
                                                    <span className="invoice-totals-value">
                                                        {formatNumber(subtotal)} <small>Fcfa</small>
                                                    </span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="invoice-totals-row">
                                                        <span className="invoice-totals-label">
                                                            {t('Réduction')}
                                                            {order.promotion_code && (
                                                                <span className="invoice-promo-code ms-1">({order.promotion_code})</span>
                                                            )}
                                                        </span>
                                                        <span className="invoice-totals-value text-success">
                                                            -{formatNumber(discount)} <small>Fcfa</small>
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="invoice-totals-row invoice-grand-total">
                                                    <span className="invoice-totals-label">{t('Montant Total')}</span>
                                                    <span className="invoice-totals-value">
                                                        {formatNumber(order.montant)} <small>Fcfa</small>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Thank you note */}
                                <div className="invoice-thank-you-inline text-center">
                                    <p className="mb-0">
                                        {t('Merci pour votre confiance !')} — Profood, {t('La qualité à votre table')}
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </Col>

                    {/* Bottom print button */}
                    <Col xs={12} className="no-printable">
                        <Card className='border-0 rounded-1'>
                            <CardBody>
                                <div className='d-flex flex-row flex-wrap align-items-center justify-content-end'>
                                    <div className='d-flex align-items-center'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            color='success'
                                            className="rounded-1"
                                            onClick={() => { window.print(); }}
                                        >
                                            <span className="icon-wrapper me-2">
                                                <FontAwesomeIcon icon={faPrint} />
                                            </span>
                                            <span>{t('Imprimer')}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OrderInvoicePageContent;
