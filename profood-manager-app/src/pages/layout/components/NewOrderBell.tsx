import React, { useState } from 'react';

import {
    Badge,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';

import { Bell, BellFill } from 'react-bootstrap-icons';

import moment from 'moment';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

import useNewOrderAlert from '../../../components/hooks/useNewOrderAlert';
import useGoTo from '../../../components/hooks/useGoTo';
import { formatNumber } from '../../../helpers/AssetHelpers';

/**
 * Header bell showing a live count of NEW awaiting orders. The count derives
 * from the orders already in the data context (refreshed on an interval by
 * DataProvider); opening the dropdown previews the newest ones and closing it
 * marks them seen. Read-only — no server writes.
 */
const NewOrderBell: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { unreadCount, newOrders, soundEnabled, markSeen, toggleSound } = useNewOrderAlert();
    const [open, setOpen] = useState(false);

    moment.locale(i18n.language);

    const toggle = () => {
        setOpen((prev) => {
            // Acknowledge (mark seen) when the dropdown closes, so the list stays
            // populated while it is open.
            if (prev) {
                markSeen();
            }
            return !prev;
        });
    };

    const preview = newOrders.slice(0, 5);

    const customerName = (order: typeof newOrders[number]): string => {
        if (order.customer) {
            return `${order.customer.user?.first_name ?? ''} ${order.customer.user?.last_name ?? ''}`.trim();
        }
        if (order.guest_first_name) {
            return `${order.guest_first_name} ${order.guest_last_name ?? ''}`.trim();
        }
        return t('Invité');
    };

    return (
        <Dropdown isOpen={open} toggle={toggle} className="new-order-bell">
            <DropdownToggle
                color='light'
                size='sm'
                caret={false}
                className="d-flex flex-center content-color border-0 position-relative"
                title={unreadCount > 0 ? `${unreadCount} ${t('Nouvelles commandes')}` : t('Aucune nouvelle commande')}
            >
                {unreadCount > 0 ? <BellFill /> : <Bell />}
                {unreadCount > 0 && (
                    <Badge
                        color='danger'
                        pill
                        className="position-absolute top-0 start-100 translate-middle fs-9"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </DropdownToggle>
            <DropdownMenu end className="fs-8">
                <DropdownItem header>{t('Nouvelles commandes')}</DropdownItem>
                {preview.length === 0 ? (
                    <DropdownItem disabled>{t('Aucune nouvelle commande')}</DropdownItem>
                ) : (
                    preview.map((order) => (
                        <DropdownItem key={order.id} onClick={() => goTo(`/commandes/${order.string_id}`)}>
                            <div className="d-flex flex-column">
                                <span className="fw-medium title-color">
                                    {order.string_id} — {formatNumber(order.montant)} Fcfa
                                </span>
                                <span className="text-muted fs-9">
                                    {customerName(order)} · {moment(order.created_at).fromNow()}
                                </span>
                            </div>
                        </DropdownItem>
                    ))
                )}
                <DropdownItem divider />
                <DropdownItem onClick={() => goTo('/commandes')}>{t('Voir les commandes')}</DropdownItem>
                <DropdownItem toggle={false} onClick={toggleSound}>
                    {soundEnabled ? t('Désactiver le son') : t('Activer le son')}
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default NewOrderBell;
