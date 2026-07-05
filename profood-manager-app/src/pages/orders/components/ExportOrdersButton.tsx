import React from 'react';

import { Button } from 'reactstrap';
import { Download } from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import { OrderProps } from '../../../types';
import { formatDate } from '../../../helpers/AssetHelpers';
import { toCsv, downloadCsv } from '../../../helpers/exportCsv';

interface ExportOrdersButtonProps {
    /** The orders to export — pass the already search/status-filtered list so the
     *  export matches what the user currently sees. */
    orders: OrderProps[];
}

/**
 * Exports the given orders to a CSV file, fully client-side (no backend call,
 * no dependency). One row per order, guest-aware customer name/phone.
 */
const ExportOrdersButton: React.FC<ExportOrdersButtonProps> = ({ orders }) => {
    const { t } = useTranslation();

    const handleExport = () => {
        const headers = [
            t('N° commande'), t('Date'), t('Client'), t('Téléphone'),
            t('Statut'), t('Paiement'), t('Mode de paiement'), t('Montant'),
            t('Réduction'), t('Code promotionnel'), t('Adresse'), t('Invité'),
            t('Boxes'), t('Au détail'),
        ];
        const rows = orders.map((order) => {
            const user = order.customer?.user;
            const firstName = user?.first_name ?? order.guest_first_name ?? '';
            const lastName = user?.last_name ?? order.guest_last_name ?? '';
            const phone = user?.phone_number ?? order.guest_phone_number ?? '';
            return [
                order.string_id,
                formatDate(new Date(order.created_at), 'long', '-', false),
                `${firstName} ${lastName}`.trim() || t('Invité'),
                phone,
                order.status?.wording ? t(order.status.wording) : '',
                order.payment_status?.wording ? t(order.payment_status.wording) : '',
                order.payment_method ? t(order.payment_method) : '',
                order.montant,
                order.discount_amount ?? 0,
                order.promotion_code ?? '',
                order.address ?? '',
                order.is_guest_order ? t('Oui') : t('Non'),
                order.cart?.boxes_data?.length ?? 0,
                order.cart?.slices_data?.length ?? 0,
            ];
        });
        const csv = toCsv(headers, rows);
        downloadCsv(`commandes-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    };

    return (
        <Button
            tag='button'
            type='button'
            color="secondary"
            size='md'
            className="d-flex flex-center gap-2 rounded-1"
            disabled={orders.length === 0}
            title={t('Exporter (CSV)')}
            onClick={handleExport}
        >
            <Download />
            <span className="d-none d-md-inline">{t('Exporter (CSV)')}</span>
        </Button>
    );
};

export default ExportOrdersButton;
