import React, { useEffect, useState } from "react";

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Spinner,
    Table
} from "reactstrap";

import { useTranslation } from "react-i18next";

import { CustomerProps, OrderProps } from "../../../types";
import { formatDate, formatNumber } from "../../../helpers/AssetHelpers";
import api from "../../../api/api";
import { getFgAndBgByOrderStatus } from "../../orders/components/OrdersList";

/**
 * Order history for a customer. Fetches directly from the existing
 * `GET /get-customer-orders/{id}` endpoint (OrderController::getCustomerOrders,
 * expects the Customer id) which also folds in matching guest orders. The
 * request carries the Bearer token like the rest of the manager app.
 *
 * @param customer
 * @returns
 */
const CustomerOrderHistory: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const [orders, setOrders] = useState<OrderProps[]>([]);

    /**
     *
     */
    const [loading, setLoading] = useState<boolean>(true);

    /**
     *
     */
    const [error, setError] = useState<boolean>(false);

    /**
     *
     */
    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('token');

        setLoading(true);
        setError(false);

        api.get(`/get-customer-orders/${customer.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
            if (!isMounted) {
                return;
            }
            setOrders(Array.isArray(response.data) ? response.data : []);
        })
        .catch(() => {
            if (!isMounted) {
                return;
            }
            setError(true);
        })
        .finally(() => {
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [customer.id]);

    /**
     *
     */
    return (
        <Card
            id="customerOrderHistory"
            className="border-0"
        >
            <CardHeader className="title-color bg-transparent py-5 px-6">
                <CardTitle
                    tag='h3'
                    className="fs-6 mb-0"
                >
                    <span>{t('Historique des commandes')}</span>
                </CardTitle>
            </CardHeader>
            <CardBody className="py-8 px-6">
            {
                loading
                ?
                <div className="d-flex align-items-center gap-2 text-muted fs-8">
                    <Spinner size="sm" />
                    <span>{t('Chargement...')}</span>
                </div>
                :
                error
                ?
                <div className="fw-medium fs-8 text-danger">
                    <span>{t('Une erreur est survenue lors du chargement des commandes.')}</span>
                </div>
                :
                orders.length === 0
                ?
                <div className="fw-medium fs-8 text-muted">
                    <span>{t('Aucune commande')}</span>
                </div>
                :
                <div className="table-responsive">
                    <Table className="align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="fw-semibold fs-8 text-muted">{t('N° commande')}</th>
                                <th className="fw-semibold fs-8 text-muted">{t('Date')}</th>
                                <th className="fw-semibold fs-8 text-muted">{t('Montant')}</th>
                                <th className="fw-semibold fs-8 text-muted">{t('Statut')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            orders.map((order) => {
                                return (
                                    <tr key={order.id}>
                                        <td className="fw-semibold fs-8 content-color">
                                            {order.string_id}
                                        </td>
                                        <td className="fs-8 content-color">
                                            {formatDate(new Date(order.created_at), 'medium')}
                                        </td>
                                        <td className="fs-8 content-color">
                                            {formatNumber(order.montant)} Fcfa
                                        </td>
                                        <td>
                                            <span className={`badge ${getFgAndBgByOrderStatus(order.status)} fw-medium`}>
                                                {t(order.status.wording)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </Table>
                </div>
            }
            </CardBody>
        </Card>
    );
};

export default CustomerOrderHistory;
