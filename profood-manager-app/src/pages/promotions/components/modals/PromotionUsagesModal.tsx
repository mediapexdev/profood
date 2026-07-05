import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalBody,
    ModalHeader,
    Spinner,
    Table
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import { formatDate, formatNumber } from '../../../../helpers/AssetHelpers';
import { PromotionProps, PromotionUsageProps } from '../../../../types';

interface PromotionUsagesModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    /** Called after the modal close animation completes — used to clear the parent's selection. */
    onClosed: () => void;
    promotion: PromotionProps;
}

/**
 * The API eager-loads `user` and `order` on each usage, but those relations are
 * not part of the base PromotionUsageProps shape — declare them locally so we
 * can show a readable order reference and customer name when available.
 */
interface UsageRow extends PromotionUsageProps {
    user?: { first_name?: string | null; last_name?: string | null } | null;
    order?: { string_id?: string | null } | null;
}

/**
 * Read-only modal listing every time a promotion was redeemed.
 *
 * Fetches GET /promotions/{id}/usages (PromotionController::usages), which
 * returns a paginated set with `user` and `order` eager-loaded. We request a
 * large page so the whole history fits without paging controls — the volume
 * per promotion is small.
 */
const PromotionUsagesModal: React.FC<PromotionUsagesModalProps> = ({
    promotion,
    show,
    setShow,
    toggle,
    onClosed,
}) => {
    const { t } = useTranslation();

    const [usages, setUsages] = useState<UsageRow[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!show) {
            return;
        }

        let isMounted = true;
        const token = localStorage.getItem('token');

        setLoading(true);
        setError(false);

        api.get(`/promotions/${promotion.id}/usages`, {
            params: { per_page: 100 },
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!isMounted) {
                    return;
                }
                const rows = response.data?.usages?.data;
                setUsages(Array.isArray(rows) ? rows : []);
                setTotal(Number(response.data?.usages?.total ?? (Array.isArray(rows) ? rows.length : 0)));
            })
            .catch(() => {
                if (isMounted) {
                    setError(true);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [promotion.id, show]);

    const customerName = (row: UsageRow) => {
        const name = `${row.user?.first_name ?? ''} ${row.user?.last_name ?? ''}`.trim();
        return name || t('Client');
    };

    return (
        <Modal
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            centered
            size='lg'
        >
            <ModalHeader toggle={() => setShow(false)}>
                <span>{t('Utilisations')} — {promotion.code}</span>
            </ModalHeader>
            <ModalBody>
            {
                loading
                ?
                <div className='d-flex align-items-center gap-2 text-muted fs-8'>
                    <Spinner size='sm' />
                    <span>{t('Chargement...')}</span>
                </div>
                :
                error
                ?
                <div className='fw-medium fs-8 text-danger'>
                    <span>{t('Une erreur est survenue lors du chargement des utilisations.')}</span>
                </div>
                :
                usages.length === 0
                ?
                <div className='fw-medium fs-8 text-muted'>
                    <span>{t('Aucune utilisation')}</span>
                </div>
                :
                <>
                    <div className='fs-8 text-muted mb-3'>
                        {total} {t('Utilisations')}
                    </div>
                    <div className='table-responsive'>
                        <Table className='align-middle mb-0'>
                            <thead>
                                <tr>
                                    <th className='fw-semibold fs-8 text-muted'>{t('Date')}</th>
                                    <th className='fw-semibold fs-8 text-muted'>{t('N° commande')}</th>
                                    <th className='fw-semibold fs-8 text-muted'>{t('Client')}</th>
                                    <th className='fw-semibold fs-8 text-muted text-end'>{t('Réduction')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                usages.map((row) => (
                                    <tr key={row.id}>
                                        <td className='fs-8 content-color'>
                                            {formatDate(new Date(row.created_at), 'medium')}
                                        </td>
                                        <td className='fw-semibold fs-8 content-color'>
                                            {row.order?.string_id ?? `#${row.order_id}`}
                                        </td>
                                        <td className='fs-8 content-color'>
                                            {customerName(row)}
                                        </td>
                                        <td className='fs-8 content-color text-end'>
                                            {formatNumber(Number(row.discount_applied))} Fcfa
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </div>
                </>
            }
            </ModalBody>
        </Modal>
    );
};

export default PromotionUsagesModal;
