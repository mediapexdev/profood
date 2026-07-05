import React from 'react';
import { Badge, Card, CardBody, CardHeader, CardTitle, Table } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import { OrderProps } from '../../../types';

/**
 * Lists the refunds recorded on an order with the total returned and whether it
 * is a partial or full refund. Renders nothing when there are no refunds.
 */
const OrderRefundsView: React.FC<{ order: OrderProps }> = ({ order }) => {
    const { t } = useTranslation();

    const refunds = order.refunds ?? [];
    if (refunds.length === 0) {
        return null;
    }

    const total = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const isFull = total >= Number(order.montant);

    return (
        <Card className="border-0 shadow-sm mb-5">
            <CardHeader className="bg-transparent py-4 d-flex align-items-center justify-content-between">
                <CardTitle tag="h3" className="fs-7 mb-0">{t('Remboursements')}</CardTitle>
                <Badge className={`${isFull ? 'bg-light-danger text-danger' : 'bg-light-warning text-warning'} fw-medium`}>
                    {isFull ? t('Remboursé') : t('Remboursé partiellement')} — {formatNumber(total)} Fcfa
                </Badge>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="table-responsive">
                    <Table className="align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="fw-semibold fs-8 text-muted">{t('Date')}</th>
                                <th className="fw-semibold fs-8 text-muted">{t('Motif')}</th>
                                <th className="fw-semibold fs-8 text-muted text-end">{t('Montant')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            refunds.map((refund) => (
                                <tr key={refund.id}>
                                    <td className="fs-8 content-color">{formatDate(new Date(refund.created_at), 'medium')}</td>
                                    <td className="fs-8 content-color">{refund.reason ?? '—'}</td>
                                    <td className="fs-8 content-color text-end">{formatNumber(Number(refund.amount))} Fcfa</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    );
};

export default OrderRefundsView;
