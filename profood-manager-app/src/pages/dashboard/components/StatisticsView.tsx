import React from 'react';

import {
    Card,
    CardBody,
    CardTitle,
    Col,
    Row
} from 'reactstrap';

import {
    BagFill,
    BoxFill,
    CartFill,
    GridFill,
    PeopleFill,
    PersonFillCheck
} from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../components/contexts/DataProvider';
import { StatisticsElement } from './types';

import './StatisticsView.css';

/**
 *
 */
interface Props {
    items?: StatisticsElement[];
    colSizes?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
}

/**
 *
 * @returns
 */
const StatisticsView: React.FC<Props> = ({ items, colSizes }) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const {
        boxTypes,
        categories,
        customers,
        orders,
        slices
    } = useDataContext();

    /**
     *
     */
    const defaultItems: StatisticsElement[] = [
        {
            id: 'customers',
            title: t('Clients'),
            number : customers.length,
            icon: <PeopleFill size={32} />,
            color: 'rgba(241,180,76,0.85)'
        },
        {
            id: 'connectedCustomers',
            title: t('Clients connect\u00e9s'),
            number : customers.filter((c) => c.user.logged).length,
            icon: <PersonFillCheck size={32} />,
            color: 'rgba(52,195,143,0.85)'
        },
        {
            id: 'availableProducts',
            title: t('Produits disponibles'),
            number : slices.length,
            icon: <BagFill size={32} />,
            color: 'rgba(255,89,89,0.85)'
        },
        {
            id: 'productCategories',
            title: t('Cat\u00e9gories de produits'),
            number : categories.length,
            icon: <GridFill size={32} />,
            color: 'rgba(0,191,255,0.85)'
        },
        {
            id: 'boxTypes',
            title: t('Types de Box'),
            number : boxTypes.length,
            icon: <BoxFill size={32} />,
            color: 'rgba(255,192,203,0.85)'
        },
        {
            id: 'customers',
            title: t('Commandes'),
            number : orders.length,
            icon: <CartFill size={32} />,
            color: 'rgba(85,110,230,0.85)'
        },
    ];

    const statisticsElements = items ?? defaultItems;
    const defaultColSizes = { xs: 12, sm: 6, xl: 4, xxl: 3 };
    const sizes = colSizes ?? defaultColSizes;

    return (
        <div className='statistics-elements-list position-relative'>
            <Row className='g-4'>
            {
                statisticsElements.map((element, index) => {
                    return (
                        <Col
                            key={index}
                            {...sizes}
                        >
                            <Card
                                className={`statistics-element translucent-stylee border-0 h-100${element.onClick ? ' cursor-pointer' : ''}`}
                                onClick={element.onClick}
                                style={element.onClick ? { cursor: 'pointer' } : undefined}
                            >
                                <CardBody className='mt-2'>
                                    <div className='d-flex flex-stack'>
                                        <div className='text-wrapper d-flex flex-column justify-content-center gap-4'>
                                            <CardTitle
                                                tag='h3'
                                                className='custom font-sm fw-medium order-statistics-item-title text-gray-700 mb-0'
                                            >
                                                <span>{element.title}</span>
                                            </CardTitle>
                                            <span className='h3 fw-semibold title-color'>{element.number}</span>
                                        </div>
                                        <div
                                            className='icon-wrapper d-flex flex-center text-gray-6000 text-white rounded-circle h-48px w-48px'
                                            style={{background: element.color}}
                                        >
                                        {
                                            element.icon
                                        }
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    );
                })
            }
            </Row>
        </div>
    );
};

export default StatisticsView;
