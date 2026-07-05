import React, { useMemo } from 'react';

import { Col } from 'reactstrap';

import {
    CheckCircleFill,
    ExclamationTriangleFill,
    GearFill,
    TruckFront
} from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { StatisticsElement } from './types';
import useGoTo from '../../../components/hooks/useGoTo';

import TodaySnapshotView from './TodaySnapshotView';
import StatisticsView from './StatisticsView';
import RevenueChartView from './RevenueChartView';
import BoxTypesPercentageChartViewInOrders from './BoxTypesPercentageChartViewInOrders';
import RecentOrdersView from './RecentOrdersView';
import DailyActivityView from './DailyActivityView';
import BestSellersView from './BestSellersView';

/**
 *
 */
interface Props {
    datePickerSection: React.ReactNode;
}

/**
 *
 * @returns
 */
const AdminDashboard: React.FC<Props> = ({ datePickerSection }) => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { orders } = useDataContext();

    const navigateToOrders = () => goTo('/commandes');

    const pipelineKPIs: StatisticsElement[] = useMemo(() => {
        const pending = orders.filter(o => o.status.code === 8).length;
        const processing = orders.filter(o => o.status.code === 16).length;
        const inDelivery = orders.filter(o => o.status.code === 32).length;
        const delivered = orders.filter(o => o.status.code === 64).length;

        return [
            {
                id: 'pending',
                title: t('En attente'),
                number: pending,
                icon: <ExclamationTriangleFill size={32} />,
                color: 'rgba(241,180,76,0.85)',
                onClick: navigateToOrders
            },
            {
                id: 'processing',
                title: t('En traitement'),
                number: processing,
                icon: <GearFill size={32} />,
                color: 'rgba(85,110,230,0.85)',
                onClick: navigateToOrders
            },
            {
                id: 'inDelivery',
                title: t('En livraison'),
                number: inDelivery,
                icon: <TruckFront size={32} />,
                color: 'rgba(0,191,255,0.85)',
                onClick: navigateToOrders
            },
            {
                id: 'delivered',
                title: t('Livrées'),
                number: delivered,
                icon: <CheckCircleFill size={32} />,
                color: 'rgba(52,195,143,0.85)',
                onClick: navigateToOrders
            }
        ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders, t]);

    return (
        <>
            {/* Section 1: Today's Snapshot */}
            <Col xs={12}>
                <TodaySnapshotView />
            </Col>

            {/* Section 2: Pipeline KPIs */}
            <Col xs={12}>
                <StatisticsView items={pipelineKPIs} colSizes={{ xs: 6, lg: 3 }} />
            </Col>

            {/* Section 3: Date picker */}
            {datePickerSection}

            {/* Section 4: Revenue Chart + Box Types */}
            <Col xs={12} lg={8}>
                <RevenueChartView />
            </Col>
            <Col xs={12} lg={4}>
                <BoxTypesPercentageChartViewInOrders />
            </Col>

            {/* Section 4b: Best sellers (period-scoped) */}
            <Col xs={12}>
                <BestSellersView />
            </Col>

            {/* Section 5: Recent Orders + Daily Activity */}
            <Col xs={12} lg={7}>
                <RecentOrdersView />
            </Col>
            <Col xs={12} lg={5}>
                <DailyActivityView />
            </Col>

            {/* Section 6: Overview Stats */}
            <Col xs={12}>
                <StatisticsView />
            </Col>
        </>
    );
};

export default AdminDashboard;
