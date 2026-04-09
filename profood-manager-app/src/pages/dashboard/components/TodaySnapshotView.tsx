import React, { useMemo } from 'react';

import {
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap';

import { ArrowUpShort, ArrowDownShort } from 'react-bootstrap-icons';

import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';

/**
 *
 * @returns
 */
const TodaySnapshotView: React.FC = () => {
    const { t } = useTranslation();
    const { orders } = useDataContext();

    const snapshot = useMemo(() => {
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');

        const todayOrders = orders.filter(o => moment(o.created_at).isSame(today, 'day'));
        const yesterdayOrders = orders.filter(o => moment(o.created_at).isSame(yesterday, 'day'));

        const todayCount = todayOrders.length;
        const yesterdayCount = yesterdayOrders.length;
        const countDelta = todayCount - yesterdayCount;

        const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.montant), 0);
        const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + Number(o.montant), 0);
        const revenueDeltaPercent = yesterdayRevenue > 0
            ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
            : todayRevenue > 0 ? 100 : 0;

        return {
            todayCount,
            countDelta,
            todayRevenue,
            revenueDeltaPercent
        };
    }, [orders]);

    return (
        <Row className='g-4'>
            <Col xs={12} sm={6}>
                <Card className='border-0 h-100'>
                    <CardBody className='py-5 px-6'>
                        <div className='d-flex flex-column gap-2'>
                            <span className='fs-8 fw-medium text-muted'>
                                {t("Commandes du jour")}
                            </span>
                            <div className='d-flex align-items-end gap-3'>
                                <span className='h3 fw-semibold title-color mb-0'>
                                    {snapshot.todayCount}
                                </span>
                                {snapshot.countDelta !== 0 && (
                                    <span className={`d-inline-flex align-items-center fs-8 fw-medium ${snapshot.countDelta > 0 ? 'text-success' : 'text-danger'}`}>
                                        {snapshot.countDelta > 0 ? <ArrowUpShort size={18} /> : <ArrowDownShort size={18} />}
                                        {snapshot.countDelta > 0 ? '+' : ''}{snapshot.countDelta} {t('vs hier')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
            <Col xs={12} sm={6}>
                <Card className='border-0 h-100'>
                    <CardBody className='py-5 px-6'>
                        <div className='d-flex flex-column gap-2'>
                            <span className='fs-8 fw-medium text-muted'>
                                {t("Chiffre d'affaires du jour")}
                            </span>
                            <div className='d-flex align-items-end gap-3'>
                                <span className='h3 fw-semibold title-color mb-0'>
                                    {formatNumber(snapshot.todayRevenue)} Fcfa
                                </span>
                                {snapshot.revenueDeltaPercent !== 0 && (
                                    <span className={`d-inline-flex align-items-center fs-8 fw-medium ${snapshot.revenueDeltaPercent > 0 ? 'text-success' : 'text-danger'}`}>
                                        {snapshot.revenueDeltaPercent > 0 ? <ArrowUpShort size={18} /> : <ArrowDownShort size={18} />}
                                        {snapshot.revenueDeltaPercent > 0 ? '+' : ''}{snapshot.revenueDeltaPercent}% {t('vs hier')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default TodaySnapshotView;
