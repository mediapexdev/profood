import React from "react";

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Row
} from "reactstrap";

import { useTranslation } from "react-i18next";

import { CustomerProps } from "../../../types";
import { formatNumber } from "../../../helpers/AssetHelpers";

/**
 * Lifetime-value tiles for a customer: total spent, orders count and average
 * order. The `stats` block is attached by the API (CustomerController::
 * addSegmentData / CustomerSegmentService); when it is missing we render
 * nothing rather than showing NaN.
 *
 * @param customer
 * @returns
 */
const CustomerLifetimeStats: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const stats = customer.stats;

    if (!stats) {
        return null;
    }

    /**
     *
     */
    const tiles = [
        {
            wording: t('Total dépensé'),
            value: `${formatNumber(stats.total_spent)} Fcfa`
        },
        {
            wording: t('Nombre de commandes'),
            value: formatNumber(stats.orders_count)
        },
        {
            wording: t('Panier moyen'),
            value: `${formatNumber(stats.average_order)} Fcfa`
        }
    ];

    /**
     *
     */
    return (
        <Card
            id="customerLifetimeStats"
            className="border-0"
        >
            <CardHeader className="title-color bg-transparent py-5 px-6">
                <CardTitle
                    tag='h3'
                    className="fs-6 mb-0"
                >
                    <span>{t('Valeur vie client')}</span>
                </CardTitle>
            </CardHeader>
            <CardBody className="py-8 px-6">
                <Row className="gy-5">
                {
                    tiles.map((tile, key) => {
                        return (
                            <Col
                                key={key}
                                sm={6}
                                lg={4}
                            >
                                <div className="border rounded p-5 h-100 d-flex flex-column">
                                    <div className="fw-medium fs-8 text-muted mb-2">
                                        <span>{tile.wording}</span>
                                    </div>
                                    <div className="fw-bold fs-4 content-color">
                                        <span>{tile.value}</span>
                                    </div>
                                </div>
                            </Col>
                        );
                    })
                }
                </Row>
            </CardBody>
        </Card>
    );
};

export default CustomerLifetimeStats;
