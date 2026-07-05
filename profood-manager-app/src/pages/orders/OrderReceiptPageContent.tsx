import React from "react";

import {
    Button,
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

import './OrderReceiptPageContent.css';

/**
 *
 * @param order
 * @returns
 */
const OrderReceiptPageContent: React.FC<OrderProps> = (order: OrderProps) => {
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
    const customerName = order.customer
        ? `${order.customer.user.first_name} ${order.customer.user.last_name}`
        : order.guest_first_name
            ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`
            : t('Invité');

    const customerPhone = order.customer?.user?.phone_number ?? order.guest_phone_number ?? '';

    /**
     * Calculate boxes subtotal
     */
    const boxesSubtotal = order.cart.boxes_data.reduce((sum, box) => sum + Number(box.type?.price ?? 0), 0);

    /**
     * Calculate slices subtotal
     */
    const slicesSubtotal = order.cart.slices_data.reduce((sum, cs) => sum + (Number(cs.slice?.price ?? 0) * cs.quantity), 0);

    /**
     *
     */
    return (
        <div
            id="orderReceiptPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-4 justify-content-center">
                    {/* Toolbar */}
                    <Col xs={12} md={8} lg={6} className="no-printable">
                        <div className="d-flex flex-row flex-wrap flex-stack">
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
                                    onClick={() => {
                                        window.print();
                                    }}
                                >
                                    <span className="icon-wrapper me-2">
                                        <FontAwesomeIcon icon={faPrint} />
                                    </span>
                                    <span>{t('Imprimer le reçu')}</span>
                                </Button>
                            </div>
                        </div>
                    </Col>

                    {/* Receipt */}
                    <Col xs={12} md={8} lg={6}>
                        <div className="order-receipt">
                            {/* Header */}
                            <div className="receipt-header">
                                <img
                                    src={toAbsolutePublicUrl('/assets/media/images/logos/profood-new.png')}
                                    className="receipt-logo"
                                    alt='Logo Profood'
                                />
                                <div className="receipt-contact">
                                    <div>contact@profood.sn</div>
                                    <div>+221 77 856 89 89</div>
                                    <div>www.profood.sn</div>
                                </div>
                            </div>

                            <div className="receipt-separator"></div>

                            {/* Order info */}
                            <div className="receipt-order-info">
                                <div><strong>{t('Commande')}:</strong> {order.string_id}</div>
                                <div><strong>{t('Date')}:</strong> {formatDate(new Date(order.created_at), 'long', '-', true, 'short')}</div>
                                <div><strong>{t('Client(e)')}:</strong> {customerName}</div>
                                {customerPhone && (
                                    <div><strong>{t('Téléphone')}:</strong> {formatPhoneNumber(customerPhone)}</div>
                                )}
                            </div>

                            <div className="receipt-separator"></div>

                            {/* Articles - Boxes */}
                            {order.cart.boxes_data.length > 0 && (
                                <>
                                    <div className="receipt-section-title">{t('Boxes')}</div>
                                    {order.cart.boxes_data.map((box) => (
                                        <div key={box.id} className="receipt-box-item">
                                            <div className="receipt-box-header">
                                                <span>{box.type?.wording ?? t('Produit supprimé')}</span>
                                                <span>{formatNumber(box.type?.price ?? 0)} Fcfa</span>
                                            </div>
                                            {box.box_slices.map((bs) => (
                                                <div key={bs.id} className="receipt-box-slice">
                                                    x{bs.quantity} {bs.slice?.wording ?? t('Produit supprimé')}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="receipt-subtotal-row">
                                        <span>{t('Total des boxes')}</span>
                                        <span>{formatNumber(boxesSubtotal)} Fcfa</span>
                                    </div>
                                    <div className="receipt-separator"></div>
                                </>
                            )}

                            {/* Articles - Retail slices */}
                            {order.cart.slices_data.length > 0 && (
                                <>
                                    <div className="receipt-section-title">{t('Au détail')}</div>
                                    {order.cart.slices_data.map((cs) => (
                                        <div key={cs.id} className="receipt-slice-item">
                                            <span>x{cs.quantity} {cs.slice?.wording ?? t('Produit supprimé')}</span>
                                            <span>{formatNumber((cs.slice?.price ?? 0) * cs.quantity)} Fcfa</span>
                                        </div>
                                    ))}
                                    <div className="receipt-subtotal-row">
                                        <span>{t('Total des découpes')}</span>
                                        <span>{formatNumber(slicesSubtotal)} Fcfa</span>
                                    </div>
                                    <div className="receipt-separator"></div>
                                </>
                            )}

                            {/* Discount — shown only when a promo code reduced the total.
                                order.montant is already net, so this line makes the
                                subtotals reconcile with the total. */}
                            {Number(order.discount_amount ?? 0) > 0 && (
                                <>
                                    <div className="receipt-subtotal-row">
                                        <span>{t('Réduction')}{order.promotion_code ? ` (${order.promotion_code})` : ''}</span>
                                        <span>-{formatNumber(Number(order.discount_amount))} Fcfa</span>
                                    </div>
                                    <div className="receipt-separator"></div>
                                </>
                            )}

                            {/* Total */}
                            <div className="receipt-total-row">
                                <span>TOTAL</span>
                                <span>{formatNumber(order.montant)} Fcfa</span>
                            </div>

                            <div className="receipt-separator"></div>

                            {/* Payment info */}
                            <div className="receipt-payment-info">
                                <div><strong>{t('Mode de paiement')}:</strong> {t(order.payment_method)}</div>
                                <div><strong>{t('Statut')}:</strong> {t(order.payment_status.wording)}</div>
                            </div>

                            <div className="receipt-separator"></div>

                            {/* Footer */}
                            <div className="receipt-footer">
                                {t('Merci pour votre commande !')}
                            </div>
                        </div>
                    </Col>

                    {/* Bottom print button */}
                    <Col xs={12} md={8} lg={6} className="no-printable">
                        <div className='d-flex flex-row flex-wrap align-items-center justify-content-end'>
                            <div className='d-flex align-items-center'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className="rounded-1"
                                    onClick={() => {
                                        window.print();
                                    }}
                                >
                                    <span className="icon-wrapper me-2">
                                        <FontAwesomeIcon icon={faPrint} />
                                    </span>
                                    <span>{t('Imprimer le reçu')}</span>
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OrderReceiptPageContent;
