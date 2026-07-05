import React from 'react';
import { Badge, Card, CardBody, CardHeader, CardTitle } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { OrderProps } from '../../../types';

/**
 * Shows the proof of delivery the livreur captured at confirmation: photo(s),
 * whether the delivery was complete or partial, the item checklist and a note.
 * Renders nothing when no proof was recorded.
 */
const OrderProofView: React.FC<{ order: OrderProps }> = ({ order }) => {
    const { t } = useTranslation();

    const proof = order.deliveryProof;
    if (!proof) {
        return null;
    }

    const photos = proof.photos ?? [];
    const items = proof.items ?? [];

    return (
        <Card className="border-0 shadow-sm mb-5">
            <CardHeader className="bg-transparent py-4 d-flex align-items-center justify-content-between">
                <CardTitle tag="h3" className="fs-7 mb-0">{t('Preuve de livraison')}</CardTitle>
                <Badge className={`${proof.is_complete ? 'bg-light-success text-success' : 'bg-light-warning text-warning'} fw-medium`}>
                    {proof.is_complete ? t('Livraison complète') : t('Livraison partielle')}
                </Badge>
            </CardHeader>
            <CardBody className="pt-0">
                {photos.length > 0 && (
                    <div className="d-flex flex-wrap gap-3 mb-4">
                        {photos.map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noreferrer" className="d-block">
                                <img
                                    src={src}
                                    alt={`${t('Preuve')} ${i + 1}`}
                                    className="rounded-2"
                                    style={{ width: 96, height: 96, objectFit: 'cover' }}
                                />
                            </a>
                        ))}
                    </div>
                )}

                {items.length > 0 && (
                    <ul className="list-unstyled mb-3">
                        {items.map((item, i) => (
                            <li key={i} className="d-flex align-items-center gap-2 fs-8 mb-1">
                                <i className={`bi ${item.delivered ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`} />
                                <span className={item.delivered ? 'content-color' : 'text-muted text-decoration-line-through'}>
                                    {item.name}
                                </span>
                                <span className="text-muted ms-auto">×{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {proof.note && (
                    <div className="bg-light-warning rounded-2 p-3 fs-8 content-color">
                        <span className="fw-semibold">{t('Note')} : </span>{proof.note}
                    </div>
                )}

                {photos.length === 0 && items.length === 0 && !proof.note && (
                    <p className="fs-8 text-muted mb-0">{t('Aucun détail supplémentaire.')}</p>
                )}
            </CardBody>
        </Card>
    );
};

export default OrderProofView;
