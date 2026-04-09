import React from 'react';

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Row
} from 'reactstrap';

import ReactApexChart from 'react-apexcharts';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { OrderStatisticsItem } from './types';

import './OrdersStatisticsChartView.css';

/**
 * 
 * @returns 
 */
const OrdersStatisticsChartView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        ordersStatisticsDetails
    } = useDataContext();

    /**
     * 
     */
    const orderStatisticsItems: OrderStatisticsItem[] = [
        {
            title: t('En attente de traitement'),
            number: ordersStatisticsDetails?.awaitingProcessing?.number??0
        },
        {
            title: t('En cours de traitement'),
            number: ordersStatisticsDetails?.beingProcessed?.number??0
        },
        {
            title: t('En cours de livraison'),
            number: ordersStatisticsDetails?.inTheProcessOfDelivery?.number??0
        },
        {
            title: t('Livrées'),
            number: ordersStatisticsDetails?.delivered?.number??0
        }
    ];
    /**
     * 
     */
    const data = {
        // box:    [90, 45, 30, 150],
        // retail: [70, 30, 15, 110]
        box: [
            ordersStatisticsDetails?.awaitingProcessing?.box_count??0,
            ordersStatisticsDetails?.beingProcessed?.box_count??0,
            ordersStatisticsDetails?.inTheProcessOfDelivery?.box_count??0,
            ordersStatisticsDetails?.delivered?.box_count??0
        ],
        retail: [
            ordersStatisticsDetails?.awaitingProcessing?.slice_count??0,
            ordersStatisticsDetails?.beingProcessed?.slice_count??0,
            ordersStatisticsDetails?.inTheProcessOfDelivery?.slice_count??0,
            ordersStatisticsDetails?.delivered?.slice_count??0
        ]
    };
    return (
        <Card className='order-statistics-chart-view'>
            <CardHeader className='py-5 border-0'>
                <div className="d-flex flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-7 fw-medium mb-0"
                    >
                        <span>{t('Nombre de commandes selon le stade')}</span>
                    </CardTitle>
                </div>
                {/* <div className='d-flex flex-stack'>
                    <CardTitle
                        tag='h3'
                        className='mb-0 flex-grow-1'
                    >
                        <span>Nombre de commandes selon le stade</span>
                    </CardTitle>
                    <Button
                        tag='button'
                        type='button'
                        color='light'
                        className="btn-reload border-0 fs-7"
                        onClick={() => {
                            fetchOrdersStatisticsDetails(true, 2000)
                        }}
                    >
                        <ArrowClockwise />
                    </Button>
                </div> */}
            </CardHeader>
            <CardHeader className='p-0 border-0 bg-light-subtle'>
                <Row className='g-0 text-center'>
                {
                    orderStatisticsItems.map((item, index) => {
                        return (
                            <Col
                                key={index}
                                className={`col-order-statistics-item col-order-statistics-item-${index}`}
                                xs={6} md={3} lg={6} xl={3}
                            >
                                <div className={`order-statistics-item py-5 px-3 h-100`}>
                                    <div className="mb-1 h5">
                                        <span className="counter-value" data-target="7585">{item.number}</span>
                                    </div>
                                    <h5 className="fs-9 fw-normal text-muted mb-0">{item.title}</h5>
                                </div>
                            </Col>
                        );
                    })
                }
                </Row>
            </CardHeader>
            <CardBody className='pt-10'>
                <ReactApexChart
                    options={{
                        chart: {
                            height: 300
                        },
                        colors:[
                            // '#1AD598',
                            '#3DC2FF',
                            '#1BC5BD',
                        ],
                        // plotOptions: {
                        //     bar: {
                        //         borderRadius: 5,
                        //         horizontal: false,
                        //         columnWidth: '70%',
                        //         endingShape: 'rounded',
                        //         distributed: false,
                        //     },
                        // },
                        // dataLabels: {
                        //     enabled: false
                        // },
                        stroke: {
                            show: true,
                            width: 6,
                            colors: ['transparent']
                        },
                        xaxis: {
                            categories: [
                                orderStatisticsItems[0].title,
                                orderStatisticsItems[1].title,
                                orderStatisticsItems[2].title,
                                orderStatisticsItems[3].title,
                            ],
                        },
                        yaxis: {
                            labels: {
                                show: true
                            }
                        },
                        fill: {
                            opacity: 0.96
                        },
                        // tooltip: {
                        //     y: {
                        //         formatter: function (val : string) {
                        //             return val;
                        //             // return "$ " + val + " thousands"
                        //         }
                        //     }
                        // }
                    }}
                    series={[
                        {
                            name: t('Au détail'),
                            data: data.retail
                        },
                        {
                            name: t('Box'),
                            data: data.box
                        }
                    ]}
                    type="bar"
                    height={300}
                    // width={'100%'}
                />
            </CardBody>
        </Card>
    );
};

export default OrdersStatisticsChartView;
