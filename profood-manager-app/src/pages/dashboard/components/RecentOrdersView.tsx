import React, { useMemo } from 'react';

import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Table
} from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';
import { getFgAndBgByOrderStatus } from '../../orders/components/OrdersList';
import useGoTo from '../../../components/hooks/useGoTo';

import './RecentOrdersView.css';

/**
 *
 * @returns
 */
const RecentOrdersView: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { filteredOrders } = useDataContext();

    moment.locale(i18n.language);

    const recentOrders = useMemo(() => {
        return [...filteredOrders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8);
    }, [filteredOrders]);

    return (
        <Card className='recent-orders-view border-0 h-100'>
            <CardHeader className='py-5 border-0'>
                <div className='d-flex flex-stack'>
                    <CardTitle
                        tag='h3'
                        className='fs-7 fw-medium mb-0'
                    >
                        <span>{t('Derni\u00e8res commandes')}</span>
                    </CardTitle>
                    <span
                        className='fs-8 fw-medium text-info2 cursor-pointer'
                        role='button'
                        onClick={() => goTo('/commandes')}
                    >
                        {t('Voir tout')} &rarr;
                    </span>
                </div>
            </CardHeader>
            <CardBody className='pt-0'>
                <Table responsive size='sm' className='recent-orders-table mb-0'>
                    <thead>
                        <tr>
                            <th className='fs-9 fw-medium text-muted'>N&deg;</th>
                            <th className='fs-9 fw-medium text-muted'>{t('Client')}</th>
                            <th className='fs-9 fw-medium text-muted'>{t('Montant')}</th>
                            <th className='fs-9 fw-medium text-muted'>{t('Statut')}</th>
                            <th className='fs-9 fw-medium text-muted'>{t('Date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        recentOrders.map((order) => (
                            <tr
                                key={order.id}
                                className='cursor-pointer'
                                onClick={() => goTo(`/commandes/${order.string_id}`)}
                            >
                                <td className='fs-8 fw-medium title-color'>{order.string_id}</td>
                                <td className='fs-8 text-muted text-nowrap'>
                                    {order.customer
                                        ? `${order.customer.user?.first_name ?? ''} ${order.customer.user?.last_name ?? ''}`.trim()
                                        : order.guest_first_name
                                            ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`.trim()
                                            : t('Invité')
                                    }
                                </td>
                                <td className='fs-8 fw-medium title-color text-nowrap'>
                                    {formatNumber(order.montant)} Fcfa
                                </td>
                                <td>
                                    <Badge
                                        className={`${getFgAndBgByOrderStatus(order.status)} fw-medium fs-9`}
                                    >
                                        {t(order.status.wording)}
                                    </Badge>
                                </td>
                                <td className='fs-9 text-muted'>
                                    {moment(order.created_at).fromNow()}
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

export default RecentOrdersView;
