import React, { useMemo } from 'react';

import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle
} from 'reactstrap';

import { ExclamationTriangleFill, CreditCard2BackFill, TruckFront, ArrowRight, BoxSeam } from 'react-bootstrap-icons';

import moment from 'moment';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';
import useGoTo from '../../../components/hooks/useGoTo';

import './UrgentActionsView.css';

/**
 *
 * @returns
 */
const UrgentActionsView: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { orders, slices } = useDataContext();

    moment.locale(i18n.language);

    // Mirror of the backend default low-stock threshold.
    const DEFAULT_LOW_STOCK_THRESHOLD = 5;

    const urgentData = useMemo(() => {
        const pendingOrders = orders.filter(o => o.status.code === 8);
        const unpaidDelivered = orders.filter(o => o.status.code === 64 && o.payment_status.code !== 8);
        const inDelivery = orders.filter(o => o.status.code === 32);

        // Top 8 pending orders, oldest first
        const topPending = [...pendingOrders]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .slice(0, 8);

        // Tracked products that are out of stock or at/below their threshold.
        const tracked = slices.filter(s => s.stock_quantity !== null && s.stock_quantity !== undefined);
        const outOfStockCount = tracked.filter(s => (s.stock_quantity as number) <= 0).length;
        const lowStockCount = tracked.filter(s => {
            const qty = s.stock_quantity as number;
            const threshold = s.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
            return qty > 0 && qty <= threshold;
        }).length;

        return {
            pendingCount: pendingOrders.length,
            unpaidCount: unpaidDelivered.length,
            inDeliveryCount: inDelivery.length,
            outOfStockCount,
            restockCount: outOfStockCount + lowStockCount,
            topPending
        };
    }, [orders, slices]);

    return (
        <Card className='urgent-actions-view border-0 h-100'>
            <CardHeader className='py-5 border-0'>
                <div className='d-flex flex-stack'>
                    <CardTitle
                        tag='h3'
                        className='fs-7 fw-medium mb-0'
                    >
                        <span>{t('Actions urgentes')}</span>
                    </CardTitle>
                </div>
                <div className='d-flex flex-wrap gap-3 mt-4'>
                    <Badge
                        className='urgent-badge bg-light-warning text-warning d-inline-flex align-items-center gap-2 px-3 py-2 fs-8'
                    >
                        <ExclamationTriangleFill size={14} />
                        <span>{urgentData.pendingCount} {t('Commandes en attente')}</span>
                    </Badge>
                    <Badge
                        className='urgent-badge bg-light-danger text-danger d-inline-flex align-items-center gap-2 px-3 py-2 fs-8'
                    >
                        <CreditCard2BackFill size={14} />
                        <span>{urgentData.unpaidCount} {t('Commandes non pay\u00e9es')}</span>
                    </Badge>
                    <Badge
                        className='urgent-badge bg-light-info text-info d-inline-flex align-items-center gap-2 px-3 py-2 fs-8'
                    >
                        <TruckFront size={14} />
                        <span>{urgentData.inDeliveryCount} {t('Commandes en livraison')}</span>
                    </Badge>
                    {urgentData.restockCount > 0 && (
                        <Badge
                            role='button'
                            onClick={() => goTo('/produits')}
                            className={`urgent-badge ${urgentData.outOfStockCount > 0 ? 'bg-light-danger text-danger' : 'bg-light-warning text-warning'} d-inline-flex align-items-center gap-2 px-3 py-2 fs-8`}
                        >
                            <BoxSeam size={14} />
                            <span>{urgentData.restockCount} {t('Produits à réassortir')}</span>
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardBody className='pt-0'>
            {
                urgentData.topPending.length < 1
                ?
                <div className='d-flex flex-center py-4'>
                    <CardText className='fs-8'>{t('Aucune action urgente')}</CardText>
                </div>
                :
                <div className='urgent-orders-list'>
                {
                    urgentData.topPending.map((order) => {
                        const customerName = order.customer
                            ? `${order.customer.user?.first_name ?? ''} ${order.customer.user?.last_name ?? ''}`.trim()
                            : order.guest_first_name
                                ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`.trim()
                                : t('Invité');
                        return (
                            <div
                                key={order.id}
                                className='urgent-order-item d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 py-3 border-bottom'
                            >
                                <div className='d-flex flex-column gap-1'>
                                    <span className='fw-semibold fs-8 title-color'>{order.string_id}</span>
                                    <span className='fs-9 text-muted'>{customerName}</span>
                                </div>
                                <div className='d-flex align-items-center gap-3'>
                                    <span className='fw-medium fs-8 title-color text-nowrap'>
                                        {formatNumber(order.montant)} Fcfa
                                    </span>
                                    <span className='fs-9 text-muted text-nowrap'>
                                        {moment(order.created_at).fromNow()}
                                    </span>
                                    <Button
                                        tag='button'
                                        type='button'
                                        size='sm'
                                        color='light'
                                        className='fs-9 text-nowrap'
                                        onClick={() => goTo(`/commandes/${order.string_id}`)}
                                    >
                                        {t('Voir')}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                }
                </div>
            }
            </CardBody>
            {urgentData.pendingCount > 0 && (
                <div className='px-5 py-4 border-top'>
                    <Button
                        tag='button'
                        type='button'
                        color='link'
                        className='p-0 fs-8 text-decoration-none d-inline-flex align-items-center gap-2'
                        onClick={() => goTo('/commandes')}
                    >
                        <span>{t('Voir toutes les commandes')}</span>
                        <ArrowRight size={14} />
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default UrgentActionsView;
