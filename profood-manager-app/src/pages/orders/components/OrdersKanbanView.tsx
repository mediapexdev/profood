import React, { useMemo } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { OrderProps, OrderStatus } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import api from '../../../api/api';
import { useUserInfosContext } from '../../account/components/contexts/UserInfosProvider';
import useToast from '../../../components/hooks/useToast';
import './OrdersKanbanView.css';

// Status codes that appear as Kanban columns, sorted from left to right.
// Code 80 (cancelled) is intentionally excluded — cancelled orders are
// managed in the list view where they can be deleted, not transitioned.
const KANBAN_STATUS_CODES = [8, 16, 32, 64];

interface OrdersKanbanViewProps {
    orders: OrderProps[];
    selectedOrders: Set<number>;
    onToggleSelect: (orderId: number) => void;
}

/**
 * Main Kanban board component.
 *
 * Drag-and-drop is handled by @dnd-kit/core. An 8px activation distance on
 * the PointerSensor prevents accidental drags when the user clicks a card or
 * its checkbox. Status transitions are forward-only (higher code = later
 * stage), so dropping onto the same or an earlier column is rejected with a
 * toast instead of firing an API call.
 */
const OrdersKanbanView: React.FC<OrdersKanbanViewProps> = ({
    orders,
    selectedOrders,
    onToggleSelect
}) => {
    const { t } = useTranslation();
    const { orderStatuses, fetchOrders } = useDataContext();
    const { userPhoneNumber } = useUserInfosContext();
    const showToast = useToast();

    // Track the order being dragged so DragOverlay can render a full-fidelity
    // card clone that follows the cursor.
    const [activeOrder, setActiveOrder] = React.useState<OrderProps | null>(null);

    // Require the pointer to travel 8px before a drag starts. This makes
    // checkbox clicks and card taps feel natural without triggering a drag.
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Build the ordered list of column descriptors once per render cycle.
    // Sorting by code keeps columns in the correct workflow sequence regardless
    // of the order the API returns them.
    const kanbanStatuses = useMemo(() => {
        return orderStatuses
            .filter(s => KANBAN_STATUS_CODES.includes(s.code))
            .sort((a, b) => a.code - b.code);
    }, [orderStatuses]);

    // Pre-group orders into buckets keyed by status code for O(1) column lookup.
    const ordersByStatus = useMemo(() => {
        const grouped: Record<number, OrderProps[]> = {};
        KANBAN_STATUS_CODES.forEach(code => {
            grouped[code] = [];
        });
        orders.forEach(order => {
            if (KANBAN_STATUS_CODES.includes(order.status.code)) {
                grouped[order.status.code].push(order);
            }
        });
        return grouped;
    }, [orders]);

    const handleDragStart = (event: DragStartEvent) => {
        const { order } = event.active.data.current as { order: OrderProps };
        setActiveOrder(order);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveOrder(null);
        const { active, over } = event;

        // Drop outside any column — no-op
        if (!over) return;

        const draggedOrder = (active.data.current as { order: OrderProps }).order;
        const targetStatus = (over.data.current as { status: OrderStatus }).status;

        if (!targetStatus) return;

        // Enforce a forward-only workflow: orders can only advance to a later
        // stage (higher code). Dropping onto the current or a previous column
        // is a no-op with user feedback so the intent is clear.
        if (targetStatus.code <= draggedOrder.status.code) {
            showToast(t('Transition de statut non autorisée'), 'warning', { autoClose: 2000 });
            return;
        }

        const token = localStorage.getItem('token');
        api.post(
            '/update-order-status',
            {
                order_id: draggedOrder.id,
                status_id: targetStatus.id,
                manager_phone_number: userPhoneNumber
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((res) => {
            if (res.status === 200 && res.data.message) {
                showToast(t(res.data.message), 'success', { autoClose: 2000 });
                // Delay the refetch slightly so the success toast is readable
                // before the board re-renders with updated data.
                fetchOrders(true, 3200);
            }
        }).catch((error) => {
            showToast(
                error.response?.data?.message
                    ? t(error.response.data.message)
                    : t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"),
                'error'
            );
        });
    };

    const handleDragCancel = () => {
        setActiveOrder(null);
    };

    return (
        <div className="orders-kanban-view">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="kanban-board d-flex gap-3">
                    {kanbanStatuses.map(status => (
                        <KanbanColumn
                            key={status.code}
                            status={status}
                            orders={ordersByStatus[status.code] || []}
                            selectedOrders={selectedOrders}
                            onToggleSelect={onToggleSelect}
                        />
                    ))}
                </div>

                {/* DragOverlay renders a floating clone of the card at the
                    cursor position during a drag. It is portal-rendered above
                    all content so it never clips inside a scrolling column. */}
                <DragOverlay>
                    {activeOrder ? (
                        <KanbanCard
                            order={activeOrder}
                            isSelected={selectedOrders.has(activeOrder.id)}
                            onToggleSelect={() => {}}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default OrdersKanbanView;
