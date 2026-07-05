import React, { useState } from 'react';

import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle,
    Table
} from 'reactstrap';

import ReactApexChart from 'react-apexcharts';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatNumber } from '../../../helpers/AssetHelpers';

type Mode = 'slices' | 'boxes';

/**
 * Best-selling products over the dashboard's selected date range. Reads the
 * bestSellers report from context (fetched by DashboardPageContent alongside the
 * other stats). Horizontal bar chart + ranked table, toggleable retail / boxes.
 */
const BestSellersView: React.FC = () => {
    const { bestSellers } = useDataContext();
    const { t } = useTranslation();
    const [mode, setMode] = useState<Mode>('slices');

    const items = mode === 'slices'
        ? (bestSellers?.slices ?? []).map((s) => ({ label: s.wording, units: s.units, revenue: s.revenue }))
        : (bestSellers?.box_types ?? []).map((b) => ({ label: b.wording, units: b.units, revenue: b.revenue }));

    const hasData = items.length > 0;
    const categories = items.map((i) => i.label);
    const series = [{ name: t('Unités'), data: items.map((i) => i.units) }];

    return (
        <Card className='border-0 h-100'>
            <CardHeader className='py-5'>
                <div className='d-flex flex-stack'>
                    <CardTitle tag='h3' className="fs-7 fw-medium mb-0">
                        <span>{t('Meilleures ventes')}</span>
                    </CardTitle>
                    <ButtonGroup size="sm">
                        <Button
                            color={mode === 'slices' ? 'info2' : 'secondary'}
                            outline={mode !== 'slices'}
                            className="border-0"
                            onClick={() => setMode('slices')}
                        >
                            {t('Au détail')}
                        </Button>
                        <Button
                            color={mode === 'boxes' ? 'info2' : 'secondary'}
                            outline={mode !== 'boxes'}
                            className="border-0"
                            onClick={() => setMode('boxes')}
                        >
                            {t('Boxes')}
                        </Button>
                    </ButtonGroup>
                </div>
            </CardHeader>
            <CardBody>
                {!hasData ? (
                    <div className='d-flex flex-center py-4'>
                        <CardText className='fs-8'>{t('Aucune donnée')}</CardText>
                    </div>
                ) : (
                    <>
                        <ReactApexChart
                            options={{
                                chart: { type: 'bar', height: 320, toolbar: { show: false } },
                                plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%' } },
                                dataLabels: { enabled: true },
                                colors: ['rgba(85,110,230,0.85)'],
                                xaxis: { categories },
                                grid: { borderColor: 'rgba(0,0,0,0.05)' }
                            }}
                            series={series}
                            type='bar'
                            height={320}
                        />
                        <Table responsive size='sm' className='mb-0 mt-3'>
                            <thead>
                                <tr>
                                    <th className='fs-9 fw-medium text-muted'>#</th>
                                    <th className='fs-9 fw-medium text-muted'>{t('Produit')}</th>
                                    <th className='fs-9 fw-medium text-muted text-end'>{t('Unités')}</th>
                                    <th className='fs-9 fw-medium text-muted text-end'>{t('Revenu')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={`${item.label}-${index}`}>
                                        <td className='fs-8 text-muted'>{index + 1}</td>
                                        <td className='fs-8 fw-medium title-color'>{item.label}</td>
                                        <td className='fs-8 text-end'>{item.units}</td>
                                        <td className='fs-8 text-end'>{formatNumber(item.revenue)} Fcfa</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default BestSellersView;
