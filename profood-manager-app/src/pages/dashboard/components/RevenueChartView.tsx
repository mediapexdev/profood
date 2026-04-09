import React, { useMemo } from 'react';

import {
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle
} from 'reactstrap';

import ReactApexChart from 'react-apexcharts';
import fr from 'apexcharts/dist/locales/fr.json';

import moment from 'moment';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';

import './RevenueChartView.css';

/**
 * Abbreviate large numbers for y-axis: 1 500 000 → 1.5M, 50 000 → 50K
 */
function abbreviateNumber(val: number): string {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}K`;
    return String(Math.round(val));
}

/**
 *
 * @returns
 */
const RevenueChartView: React.FC = () => {
    const { t } = useTranslation();

    const {
        orders,
        statisticsStartDate,
        statisticsEndDate
    } = useDataContext();

    const chartData = useMemo(() => {
        moment.locale(i18n.language);
        const start = statisticsStartDate ? moment(statisticsStartDate) : moment().subtract(29, 'days');
        const end = statisticsEndDate ? moment(statisticsEndDate) : moment();

        const filteredOrders = orders.filter(order => {
            const orderDate = moment(order.created_at);
            return orderDate.isSameOrAfter(start, 'day') && orderDate.isSameOrBefore(end, 'day');
        });

        const diffDays = end.diff(start, 'days');

        let groupBy: 'day' | 'week' | 'month';
        let dateFormat: string;

        if (diffDays <= 31) {
            groupBy = 'day';
            dateFormat = 'DD MMM';
        } else if (diffDays <= 90) {
            groupBy = 'week';
            dateFormat = '[Sem.] W';
        } else {
            groupBy = 'month';
            dateFormat = 'MMM YYYY';
        }

        const groupedRevenue: Record<string, number> = {};
        const groupedCount: Record<string, number> = {};

        // Build all time slots even if no orders
        const cursor = start.clone();
        while (cursor.isSameOrBefore(end)) {
            const key = cursor.format(dateFormat);
            if (!groupedRevenue[key]) {
                groupedRevenue[key] = 0;
                groupedCount[key] = 0;
            }
            if (groupBy === 'day') {
                cursor.add(1, 'day');
            } else if (groupBy === 'week') {
                cursor.add(1, 'week');
            } else {
                cursor.add(1, 'month');
            }
        }

        // Aggregate order revenues and counts
        filteredOrders.forEach(order => {
            const key = moment(order.created_at).format(dateFormat);
            if (groupedRevenue[key] !== undefined) {
                groupedRevenue[key] += Number(order.montant);
                groupedCount[key] += 1;
            } else {
                groupedRevenue[key] = Number(order.montant);
                groupedCount[key] = 1;
            }
        });

        const categories = Object.keys(groupedRevenue);
        const revenueData = Object.values(groupedRevenue);
        const countData = Object.values(groupedCount);
        const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
        const totalOrders = countData.reduce((sum, val) => sum + val, 0);

        // Period label (e.g. "25 janv. 2026 — 23 févr. 2026")
        const periodLabel = start.format('DD MMM YYYY') + ' — ' + end.format('DD MMM YYYY');

        return { categories, revenueData, countData, totalRevenue, totalOrders, periodLabel, groupBy };
    }, [orders, statisticsStartDate, statisticsEndDate]);

    const showMarkers = chartData.categories.length <= 31;

    return (
        <Card className='revenue-chart-view border-0 h-100'>
            <CardHeader className='py-5 border-0'>
                <div className='d-flex flex-stack flex-wrap gap-2'>
                    <div className='d-flex flex-column gap-1'>
                        <CardTitle
                            tag='h3'
                            className='fs-7 fw-medium mb-0'
                        >
                            <span>{t("Évolution du chiffre d'affaires")}</span>
                        </CardTitle>
                        <span className='fs-9 text-muted'>{chartData.periodLabel}</span>
                    </div>
                    <div className='d-flex flex-column align-items-end gap-1'>
                        <span className='h5 fw-semibold title-color mb-0'>
                            {formatNumber(chartData.totalRevenue)} Fcfa
                        </span>
                        <span className='fs-9 text-muted'>
                            {chartData.totalOrders} {t('commandes')}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardBody className='pt-0'>
            {
                chartData.revenueData.length < 1
                ?
                <div className='d-flex flex-center py-4'>
                    <CardText className='fs-8'>{t('Aucune donnée')}</CardText>
                </div>
                :
                <ReactApexChart
                    options={{
                        chart: {
                            type: 'area',
                            height: 350,
                            toolbar: {
                                show: true,
                                tools: {
                                    download: true,
                                    zoom: true,
                                    zoomin: true,
                                    zoomout: true,
                                    pan: true,
                                    reset: true
                                },
                                export: {
                                    csv: { filename: t("Évolution du chiffre d'affaires") },
                                    svg: { filename: t("Évolution du chiffre d'affaires") },
                                    png: { filename: t("Évolution du chiffre d'affaires") }
                                }
                            },
                            zoom: {
                                enabled: true,
                                type: 'x',
                                autoScaleYaxis: true
                            },
                            locales: [fr],
                            defaultLocale: 'fr'
                        },
                        colors: ['#27AE60'],
                        dataLabels: {
                            enabled: false
                        },
                        stroke: {
                            curve: 'smooth',
                            width: 2.5
                        },
                        markers: {
                            size: showMarkers ? 4 : 0,
                            colors: ['#27AE60'],
                            strokeColors: '#fff',
                            strokeWidth: 2,
                            hover: {
                                size: 6
                            }
                        },
                        fill: {
                            type: 'gradient',
                            gradient: {
                                shadeIntensity: 1,
                                opacityFrom: 0.4,
                                opacityTo: 0.02,
                                stops: [0, 90, 100]
                            }
                        },
                        grid: {
                            borderColor: '#f1f1f1',
                            strokeDashArray: 4,
                            xaxis: {
                                lines: { show: false }
                            },
                            yaxis: {
                                lines: { show: true }
                            },
                            padding: {
                                top: 0,
                                bottom: 0
                            }
                        },
                        xaxis: {
                            categories: chartData.categories,
                            labels: {
                                rotate: -45,
                                rotateAlways: chartData.categories.length > 15,
                                style: {
                                    fontSize: '11px',
                                    colors: '#999'
                                }
                            },
                            axisBorder: { show: false },
                            axisTicks: { show: false }
                        },
                        yaxis: {
                            labels: {
                                formatter: (val: number) => abbreviateNumber(val),
                                style: {
                                    fontSize: '11px',
                                    colors: '#999'
                                }
                            }
                        },
                        tooltip: {
                            shared: true,
                            custom: function({ series, dataPointIndex, w }: any) {
                                const revenue = series[0][dataPointIndex];
                                const category = w.globals.categoryLabels[dataPointIndex] || chartData.categories[dataPointIndex];
                                const count = chartData.countData[dataPointIndex] || 0;
                                return `<div class="revenue-chart-tooltip">
                                    <div class="tooltip-header">${category}</div>
                                    <div class="tooltip-body">
                                        <div class="tooltip-row">
                                            <span class="tooltip-dot"></span>
                                            <span>${formatNumber(revenue)} Fcfa</span>
                                        </div>
                                        <div class="tooltip-row tooltip-row-secondary">
                                            <span>${count} ${count > 1 ? 'commandes' : 'commande'}</span>
                                        </div>
                                    </div>
                                </div>`;
                            }
                        }
                    }}
                    series={[
                        {
                            name: t("Chiffre d'affaires"),
                            data: chartData.revenueData
                        }
                    ]}
                    type='area'
                    height={350}
                />
            }
            </CardBody>
        </Card>
    );
};

export default RevenueChartView;
