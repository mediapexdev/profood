import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Badge } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { OrderProps } from '../../../types';
import { formatNumber } from '../../../helpers/AssetHelpers';
import { getFgAndBgByOrderPaymentStatus } from './OrdersList';
import './KanbanCard.css';

interface KanbanCardProps {
    order: OrderProps;
    isSelected: boolean;
    onToggleSelect: (orderId: number) => void;
}

/**
 * Draggable card representing a single order in the Kanban board.
 *
 * The checkbox uses onPointerDown stopPropagation so that clicking it
 * does not activate the drag sensor, allowing selection and dragging to
 * coexist without conflict.
 */
const KanbanCard: React.FC<KanbanCardProps> = ({ order, isSelected, onToggleSelect }) => {
    const { t } = useTranslation();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `order-${order.id}`,
        // Attach the full order object so DragEnd handlers can read it directly
        data: { order }
    });

    // Only apply an inline transform while actively dragging; at rest the card
    // keeps its natural position in the column's DOM flow.
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const user = order.customer?.user;
    const guestName = order.guest_first_name
        ? `${order.guest_first_name} ${order.guest_last_name ?? ''}`.trim()
        : null;

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card ${isDragging ? 'is-dragging' : ''} ${isSelected ? 'is-selected' : ''}`}
            style={style}
            {...listeners}
            {...attributes}
        >
            <div className="kanban-card-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="checkbox"
                        className="kanban-card-checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelect(order.id);
                        }}
                        // Prevent the pointer-down event from reaching the drag
                        // sensor so toggling selection does not start a drag.
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                    <span className="kanban-card-id fw-semibold">{order.string_id}</span>
                </div>
                <Badge className={`${getFgAndBgByOrderPaymentStatus(order.payment_status)} fw-medium fs-9`}>
                    {t(order.payment_status.wording)}
                </Badge>
            </div>
            <div className="kanban-card-body mt-2">
                <div className="kanban-card-customer fw-medium text-truncate">
                    {user ? `${user.first_name} ${user.last_name}` : (
                        <span className="d-inline-flex align-items-center gap-1">
                            <Badge className="bg-light-secondary text-secondary fw-medium fs-10">
                                {t('Invité')}
                            </Badge>
                            {guestName && <span>{guestName}</span>}
                        </span>
                    )}
                </div>
                <div className="kanban-card-amount mt-1">
                    <span className="fw-semibold">{formatNumber(order.montant)}</span>
                    <small className="ms-1 text-muted">Fcfa</small>
                </div>
            </div>
        </div>
    );
};

export default KanbanCard;
