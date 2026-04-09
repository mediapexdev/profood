import React from 'react';

import {
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle
} from 'reactstrap';

import ReactApexChart from 'react-apexcharts';
import fr from 'apexcharts/dist/locales/fr.json';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';

import './BoxTypesPercentageChartViewInOrders.css';

/**
 * 
 * @returns 
 */
const BoxTypesPercentageChartViewInOrders: React.FC = () => {
    /**
     * 
     */
    const {
        ordersStatisticsDetails
    } = useDataContext();

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const data = {
        series: [
            Math.ceil((Number(ordersStatisticsDetails?.all?.box_types_count.Noflaye??0) * 100) / Number(ordersStatisticsDetails?.all?.box_count??0)),
            Math.ceil((Number(ordersStatisticsDetails?.all?.box_types_count.Téranga??0) * 100) / Number(ordersStatisticsDetails?.all?.box_count??0)),
            Math.ceil((Number(ordersStatisticsDetails?.all?.box_types_count.Woyofal??0) * 100) / Number(ordersStatisticsDetails?.all?.box_count??0)),
            Math.ceil((Number(ordersStatisticsDetails?.all?.box_types_count.Xéweul??0) * 100) / Number(ordersStatisticsDetails?.all?.box_count??0)),
        ]
    };
	return (
        <Card
            id='boxTypesPercentageChartViewInOrders'
            className='border-0 h-100'
        >
            <CardHeader className='py-5'>
                <div className='d-flex flex-stack'>
                    <CardTitle
                        tag='h3'
                        className="fs-7 fw-medium mb-0"
                    >
                        <span>{t('Pourcentage des Boxes dans les commandes')}</span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardBody>
            {
                Number(ordersStatisticsDetails?.all?.box_count) < 1
                ?
                <div className='d-flex flex-center py-4'>
                    <CardText className='fs-8'>{t('Aucune donnée')}</CardText>
                </div>
                :
                <ReactApexChart
                    options={{
                        chart: {
                            type: 'pie',
                            height: 420,
                            toolbar: {
                                show: true,
                                export: {
                                    csv: {
                                        filename: t('Pourcentage des Boxes dans les commandes')
                                    },
                                    svg: {
                                        filename: t('Pourcentage des Boxes dans les commandes')
                                    },
                                    png: {
                                        filename: t('Pourcentage des Boxes dans les commandes')
                                    }
                                }
                            },
                            locales: [fr],
                            defaultLocale: 'fr'
                        },
                        legend: {
                            position: 'bottom'
                        },
                        // responsive: [{
                        //     breakpoint: 480,
                        //     options: {
                        //         // chart: {
                        //         //     width: 200
                        //         // },
                        //         legend: {
                        //             position: 'bottom'
                        //         }
                        //     }
                        // }],
                        dataLabels: {
                            enabled: true,
                        },
                        plotOptions: {
                            pie: {
                                expandOnClick: true
                                // hollow: {
                                //     size: '50%',
                                // },
                                // dataLabels: {
                                //     name: {
                                //         show: false
                                //     },
                                //     value: {
                                //         fontSize: '22px'
                                //     }
                                // },
                                // track:{
                                //     background: '#f2f2f7'
                                // }
                            }
                        },
                        stroke: {
                            width: 3
                        },
                        // grid: {
                        //     padding: {
                        //         top: -45,
                        //         bottom: 0
                        //     }
                        // },
                        // fill: {
                        //     type: 'gradient',
                        //     gradient: {
                        //         shade: 'light',
                        //         shadeIntensity: 0.4,
                        //         inverseColors: false,
                        //         opacityFrom: 1,
                        //         opacityTo: 1,
                        //         stops: [0, 50, 53, 91]
                        //     },
                        // },
                        labels: [
                            'Noflaye',
                            'Téranga',
                            'Woyofal',
                            'Xéweul'
                        ],
                        colors:[
                            'rgba(0,191,255,0.85)',
                            'rgba(85,110,230,0.85)',
                            'rgba(241,180,76,0.85)',
                            'rgba(52,195,143,0.85)',
                        ],
                        responsive: [{
                            breakpoint: 576,
                            options: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }]
                    }}
                    series={data.series}
                    type='pie'
                    height={420}
                    // width={'100%'}
                />
            }
            </CardBody>
        </Card>
	);
};

export default BoxTypesPercentageChartViewInOrders;
