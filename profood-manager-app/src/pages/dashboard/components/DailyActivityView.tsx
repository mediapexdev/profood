import React, { useMemo } from 'react';

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle
} from 'reactstrap';

import ReactApexChart from 'react-apexcharts';

import moment from 'moment';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';

/**
 *
 * @returns
 */
const DailyActivityView: React.FC = () => {
    const { t } = useTranslation();
    const { orders } = useDataContext();

    const data = useMemo(() => {
        moment.locale(i18n.language);
        const days: string[] = [];
        const counts: number[] = [];

        let totalOrders = 0;
        let totalRevenue = 0;

        for (let i = 6; i >= 0; i--) {
            const day = moment().subtract(i, 'days');
            const label = day.format('dd DD');
            days.push(label.charAt(0).toUpperCase() + label.slice(1));

            const dayOrders = orders.filter(o => moment(o.created_at).isSame(day, 'day'));
            counts.push(dayOrders.length);

            totalOrders += dayOrders.length;
            totalRevenue += dayOrders.reduce((sum, o) => sum + Number(o.montant), 0);
        }

        const avgPerDay = totalOrders > 0 ? Math.round(totalRevenue / 7) : 0;

        return { days, counts, totalOrders, totalRevenue, avgPerDay };
    }, [orders]);

    return (
        <Card className='border-0 h-100 d-flex flex-column'>
            <CardHeader className='py-5 border-0'>
                <CardTitle
                    tag='h3'
                    className='fs-7 fw-medium mb-0'
                >
                    <span>{t('Activité des 7 derniers jours')}</span>
                </CardTitle>
            </CardHeader>
            <CardBody className='pt-0 d-flex flex-column'>
                <div>
                    <ReactApexChart
                        options={{
                            chart: {
                                toolbar: { show: false },
                                parentHeightOffset: 0
                            },
                            colors: ['rgba(85,110,230,0.75)'],
                            plotOptions: {
                                bar: {
                                    borderRadius: 3,
                                    columnWidth: '50%'
                                }
                            },
                            dataLabels: { enabled: false },
                            xaxis: {
                                categories: data.days,
                                labels: { style: { fontSize: '11px', colors: '#999' } },
                                axisBorder: { show: false },
                                axisTicks: { show: false }
                            },
                            yaxis: {
                                labels: { show: false },
                                axisBorder: { show: false }
                            },
                            grid: {
                                show: false,
                                padding: { left: 0, right: 0, top: -10, bottom: 0 }
                            },
                            tooltip: {
                                y: {
                                    title: {
                                        formatter: () => t('commandes') + ' :'
                                    }
                                }
                            }
                        }}
                        series={[{ name: t('Commandes'), data: data.counts }]}
                        type='bar'
                        height={180}
                    />
                </div>

                <div className='d-flex flex-column gap-3 pt-4 mt-auto border-top'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span className='fs-8 text-muted'>{t('Total 7 jours')}</span>
                        <span className='fs-8 fw-semibold title-color'>{data.totalOrders} {t('commandes')}</span>
                    </div>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span className='fs-8 text-muted'>{t('Revenus')}</span>
                        <span className='fs-8 fw-semibold title-color'>{formatNumber(data.totalRevenue)} Fcfa</span>
                    </div>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span className='fs-8 text-muted'>{t('Moyenne / jour')}</span>
                        <span className='fs-8 fw-semibold title-color'>{formatNumber(data.avgPerDay)} Fcfa</span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default DailyActivityView;
