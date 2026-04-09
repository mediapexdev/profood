import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { OrderProps, OrderStatus } from '../../../types';
import KanbanCard from './KanbanCard';
import { getFgAndBgByOrderStatus } from './OrdersList';

interface KanbanColumnProps {
    status: OrderStatus;
    orders: OrderProps[];
    selectedOrders: Set<number>;
    onToggleSelect: (orderId: number) => void;
}

/**
 * Droppable column representing one order status lane in the Kanban board.
 *
 * The column ID uses the status code (`column-{code}`) so that the DragEnd
 * handler in OrdersKanbanView can resolve the target status from the over
 * element's data without a separate lookup.
 */
const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, orders, selectedOrders, onToggleSelect }) => {
    const { t } = useTranslation();

    const { isOver, setNodeRef } = useDroppable({
        id: `column-${status.code}`,
        // Attach the status object so DragEnd can read the target status
        // directly from over.data.current without an extra find() call.
        data: { status }
    });

    return (
        <div className={`kanban-column ${isOver ? 'is-over' : ''}`}>
            <div className="kanban-column-header d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold fs-7">{t(status.wording)}</span>
                    <Badge className={`${getFgAndBgByOrderStatus(status)} fw-medium`}>
                        {orders.length}
                    </Badge>
                </div>
            </div>

            {/* The droppable ref is placed on the body, not the wrapper, so the
                entire card area (including empty space) is a valid drop target. */}
            <div
                ref={setNodeRef}
                className="kanban-column-body"
            >
                {orders.length === 0 ? (
                    <div className="kanban-empty text-muted text-center py-4 fs-8">
                        {t('Aucune commande')}
                    </div>
                ) : (
                    orders.map(order => (
                        <KanbanCard
                            key={order.id}
                            order={order}
                            isSelected={selectedOrders.has(order.id)}
                            onToggleSelect={onToggleSelect}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
