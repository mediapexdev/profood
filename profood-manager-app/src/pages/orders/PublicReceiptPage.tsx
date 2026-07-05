import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { OrderProps } from "../../types";
import { formatDate, formatNumber, formatPhoneNumber, toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import api from "../../api/api";

import './PublicReceiptPage.css';

/**
 * Receipt page. The underlying endpoint exposes customer PII, so it is
 * authenticated + staff/owner scoped; this page sends the stored staff token.
 */
const PublicReceiptPage: React.FC = () => {
    const { t } = useTranslation();
    const { id: orderId } = useParams<string>();

    const [order, setOrder] = useState<OrderProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        // The receipt endpoint is authenticated + authorized (it exposes
        // customer PII); send the staff token.
        const token = localStorage.getItem('token');
        api.get(`/receipt/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (res.status === 200) {
                    setOrder(res.data);
                } else {
                    setError(t('Commande introuvable'));
                }
            })
            .catch(() => {
                setError(t('Commande introuvable'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderId, t]);

    if (loading) {
        return (
            <div className="public-receipt-wrapper">
                <div className="public-receipt-loading">
                    {t('Veuillez patienter')}...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="public-receipt-wrapper">
                <div className="public-receipt-error">
                    {error || t('Commande introuvable')}
                </div>
            </div>
        );
    }

    const customerName = order.customer
        ? `${order.customer.user.first_name} ${order.customer.user.last_name}`
        : order.guest_first_name
            ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`
            : t('Invité');

    const customerPhone = order.customer?.user?.phone_number ?? order.guest_phone_number ?? '';

    const boxesSubtotal = order.cart.boxes_data.reduce((sum, box) => sum + Number(box.type?.price ?? 0), 0);
    const slicesSubtotal = order.cart.slices_data.reduce((sum, cs) => sum + (Number(cs.slice?.price ?? 0) * cs.quantity), 0);

    return (
        <div className="public-receipt-wrapper">
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
        </div>
    );
};

export default PublicReceiptPage;
