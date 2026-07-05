import React, { useEffect, useState } from 'react';
import { Button, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import NoPromotion from './NoPromotion';
import PromotionStatusBadge from './PromotionStatusBadge';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';
import { PromotionProps } from '../../../types';
import PromotionEditModal from './modals/PromotionEditModal';
import PromotionDeleteModal from './modals/PromotionDeleteModal';
import PromotionUsagesModal from './modals/PromotionUsagesModal';

import './PromotionsList.css';

/**
 * Human-readable labels for each discount type value stored in the database.
 * Kept outside the component to avoid re-creation on every render.
 */
const DISCOUNT_TYPE_LABELS: Record<string, string> = {
    percentage:   'Pourcentage',
    fixed_amount: 'Montant fixe',
    free_delivery: 'Livraison gratuite',
};

interface PromotionsListProps {
    promotions: PromotionProps[];
    /** When true, shows the search-specific empty state instead of the generic one. */
    fromSearch?: boolean;
}

/**
 * Tabular list of promotions with inline edit and delete actions.
 * Pagination state is persisted in sessionStorage so the user returns
 * to the same page after navigating away and back.
 */
const PromotionsList: React.FC<PromotionsListProps> = ({ promotions, fromSearch = false }) => {
    const { t } = useTranslation();

    // Restore rows-per-page preference from sessionStorage (fallback: 10).
    const [rowsPerPage, setRowsPerPage] = useState<number>(
        Number(sessionStorage.getItem('promotionsListPagination') ?? 10)
    );

    useEffect(() => {
        const stored = sessionStorage.getItem('promotionsListPagination');
        setRowsPerPage(stored !== null ? Number(stored) : 10);
    }, []);

    const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
    const { pageData, pageCount } = usePagination(promotions, currentPageNumber, rowsPerPage);

    // Guard against the current page going out of range when the data set shrinks
    // (e.g. after a deletion or a narrowed search).
    useEffect(() => {
        if (currentPageNumber > pageCount && pageCount > 0) {
            setCurrentPageNumber(pageCount);
        }
    }, [pageCount, currentPageNumber]);

    // Edit modal state — the selected promotion is cleared after the modal closes
    // (onClosed callback) to avoid stale data being displayed during the close animation.
    const [promoToEdit, setPromoToEdit] = useState<PromotionProps | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const toggleEditModal = () => setShowEditModal((prev) => !prev);
    const onClosedEditModal = () => setPromoToEdit(null);

    // Delete modal state — same deferred-clear pattern as above.
    const [promoToDelete, setPromoToDelete] = useState<PromotionProps | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const toggleDeleteModal = () => setShowDeleteModal((prev) => !prev);
    const onClosedDeleteModal = () => setPromoToDelete(null);

    // Usages modal state — read-only redemption history for a promotion.
    const [promoToView, setPromoToView] = useState<PromotionProps | null>(null);
    const [showUsagesModal, setShowUsagesModal] = useState(false);
    const toggleUsagesModal = () => setShowUsagesModal((prev) => !prev);
    const onClosedUsagesModal = () => setPromoToView(null);

    // ---------------------------------------------------------------------------
    // Cell formatters
    // ---------------------------------------------------------------------------

    /**
     * Returns a human-readable representation of the promotion's discount value.
     * - Percentage: "15%"
     * - Fixed amount: "5 000 Fcfa"
     * - Free delivery: localised label (no numeric value applies)
     */
    const formatDiscountValue = (promo: PromotionProps): string => {
        switch (promo.discount_type) {
            case 'percentage':
                return `${promo.discount_value}%`;
            case 'free_delivery':
                return t('Livraison gratuite');
            default:
                return `${formatNumber(promo.discount_value)} Fcfa`;
        }
    };

    /**
     * Renders usage as "used / cap", showing "Illimité" when there is no cap.
     */
    const formatUsage = (promo: PromotionProps): string => {
        const cap = promo.usage_limit_total === null ? t('Illimité') : String(promo.usage_limit_total);
        return `${promo.usage_count} / ${cap}`;
    };

    /**
     * Formats the validity window as "DD/MM/YYYY → DD/MM/YYYY".
     * A dash is shown when a bound is absent (open-ended schedule).
     */
    const formatPeriod = (promo: PromotionProps): string => {
        const start = promo.starts_at
            ? formatDate(new Date(promo.starts_at), 'short', '-', false)
            : '-';
        const end = promo.expires_at
            ? formatDate(new Date(promo.expires_at), 'short', '-', false)
            : '-';
        return `${start} → ${end}`;
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div className='promotions-list'>
            {!pageData.length ? (
                <NoPromotion fromSearch={fromSearch} />
            ) : (
                <Table
                    responsive
                    size='sm'
                    className='promotions-table table-card table-card-bordered w-100 fs-8 align-middle table-cell-dashed gy-4 bg-transparent'
                >
                    <thead>
                        <tr>
                            <th className='ps-4'>{t('Code promotionnel')}</th>
                            <th>{t('Nom')}</th>
                            <th>{t('Type de réduction')}</th>
                            <th>{t('Valeur de réduction')}</th>
                            <th>{t('Utilisation')}</th>
                            <th>{t('Période')}</th>
                            <th>{t('Statut')}</th>
                            <th className='pe-4'>{t('Action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((promo) => (
                            <tr key={promo.id}>
                                <td className='code-cell ps-4'>
                                    <span className='fw-semibold'>{promo.code}</span>
                                    {promo.description && (
                                        <small
                                            className='d-block text-muted text-truncate'
                                            style={{ maxWidth: '200px' }}
                                            title={promo.description}
                                        >
                                            {promo.description}
                                        </small>
                                    )}
                                </td>
                                <td className='name-cell'>{promo.name}</td>
                                <td className='type-cell'>
                                    {t(DISCOUNT_TYPE_LABELS[promo.discount_type] ?? promo.discount_type)}
                                </td>
                                <td className='value-cell'>{formatDiscountValue(promo)}</td>
                                <td className='usage-cell'>{formatUsage(promo)}</td>
                                <td className='period-cell'>
                                    <small>{formatPeriod(promo)}</small>
                                </td>
                                <td className='status-cell'>
                                    <PromotionStatusBadge promotion={promo} />
                                </td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-info text-gray-700 btn-usages border-0'
                                            title={t('Utilisations')}
                                            onClick={() => {
                                                setPromoToView(promo);
                                                // Deferred open so state is set before the modal mounts
                                                setTimeout(() => setShowUsagesModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faListUl} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit border-0'
                                            title={t('Modifier')}
                                            onClick={() => {
                                                setPromoToEdit(promo);
                                                // Deferred open so state is set before the modal mounts
                                                setTimeout(() => setShowEditModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete border-0'
                                            title={t('Supprimer')}
                                            onClick={() => {
                                                setPromoToDelete(promo);
                                                setTimeout(() => setShowDeleteModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <div className='pagination-box-wrapper mt-5'>
                <Pagination
                    id='promotionsListPagination'
                    pageCount={pageCount}
                    currentPageNumber={currentPageNumber}
                    setCurrentPageNumber={setCurrentPageNumber}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />
            </div>

            {/* Only mount modals when a target promotion has been selected to avoid
                rendering stale data while the close animation is still playing. */}
            {promoToEdit && (
                <PromotionEditModal
                    show={showEditModal}
                    setShow={setShowEditModal}
                    toggle={toggleEditModal}
                    onClosed={onClosedEditModal}
                    promotion={promoToEdit}
                />
            )}
            {promoToDelete && (
                <PromotionDeleteModal
                    show={showDeleteModal}
                    setShow={setShowDeleteModal}
                    toggle={toggleDeleteModal}
                    onClosed={onClosedDeleteModal}
                    promotion={promoToDelete}
                />
            )}
            {promoToView && (
                <PromotionUsagesModal
                    show={showUsagesModal}
                    setShow={setShowUsagesModal}
                    toggle={toggleUsagesModal}
                    onClosed={onClosedUsagesModal}
                    promotion={promoToView}
                />
            )}
        </div>
    );
};

export default PromotionsList;
