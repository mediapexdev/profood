import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    Input,
    InputGroup,
    InputGroupText,
    Row
} from 'reactstrap';

import { ArrowClockwise, Grid3x3GapFill, ListUl, PlusLg } from 'react-bootstrap-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import OrdersList from './OrdersList';
import OrdersKanbanView from './OrdersKanbanView';
import ExportOrdersButton from './ExportOrdersButton';
import BulkStatusUpdateModal from './modals/BulkStatusUpdateModal';
import { OrderProps, OrderStatus } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';
import OrderStatusesMenu from './OrderStatusesMenu';
import LivreurFilterMenu, { LivreurFilter } from './LivreurFilterMenu';
import useGoTo from '../../../components/hooks/useGoTo';

import './OrdersListView.css';

type ViewMode = 'table' | 'kanban';

const OrdersListView: React.FC = () => {
    const { t } = useTranslation();
    const { orders, fetchOrders } = useDataContext();
    const goTo = useGoTo();

    const [searchedText, setSearchText] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<OrderStatus|null>(null);
    const [filterLivreur, setFilterLivreur] = useState<LivreurFilter>(null);
    const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
    const [fromSearch, setFromSearch] = useState<boolean>(false);

    // View mode persisted across page reloads so the user's preference is
    // remembered even after navigating away and returning.
    const [viewMode, setViewMode] = useState<ViewMode>(
        () => (localStorage.getItem('ordersViewMode') as ViewMode) || 'table'
    );

    const changeViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('ordersViewMode', mode);
    };

    // Bulk selection is stored as a Set of order IDs for O(1) has/add/delete
    // operations regardless of list size.
    const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

    const toggleSelect = useCallback((orderId: number) => {
        setSelectedOrders(prev => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedOrders(new Set());
    }, []);

    // Bulk status update modal
    const [showBulkModal, setShowBulkModal] = useState(false);
    const toggleBulkModal = () => setShowBulkModal(prev => !prev);

    // Derive the full order objects for the currently selected IDs so the
    // modal can display them and send the correct payloads.
    const selectedOrderObjects = filteredOrders.filter(o => selectedOrders.has(o.id));

    const checkStatus = useCallback((order: OrderProps) => {
        return filterStatus !== null && order.status.id === filterStatus.id;
    }, [filterStatus]);

    const checkLivreur = useCallback((order: OrderProps) => {
        if (filterLivreur === null) {
            return true;
        }
        if (filterLivreur === 'unassigned') {
            return !order.livreur;
        }
        return order.livreur?.id === filterLivreur.id;
    }, [filterLivreur]);

    const checkSearchedText = useCallback((order: OrderProps) => {
        const user = order.customer?.user;
        const firstName = user?.first_name ?? order.guest_first_name ?? '';
        const lastName = user?.last_name ?? order.guest_last_name ?? '';
        return (order.string_id.toLowerCase().indexOf(searchedText) > -1 ||
                firstName.toLowerCase().indexOf(searchedText) > -1 ||
                lastName.toLowerCase().indexOf(searchedText) > -1 ||
                `${firstName} ${lastName}`.toLowerCase().indexOf(searchedText) > -1 ||
                order.address.toLowerCase().indexOf(searchedText) > -1 ||
                order.montant.toString().indexOf(searchedText) > -1 ||
                formatDate(new Date(order.created_at), 'long', '-', false).toString().indexOf(searchedText) > -1);
    }, [searchedText]);

    useEffect(() => {
        let f_orders = filterStatus !== null ? orders.filter(checkStatus) : orders;
        let active = filterStatus !== null;

        if(filterLivreur !== null){
            f_orders = f_orders.filter(checkLivreur);
            active = true;
        }

        if(searchedText.length > 0){
            f_orders = f_orders.filter(checkSearchedText);
            active = true;
        }
        setFromSearch(active);
        setFilteredOrders(f_orders);
    }, [orders, searchedText, filterStatus, filterLivreur, checkStatus, checkLivreur, checkSearchedText]);

    // Clear bulk selection whenever the visible order list changes so
    // previously selected items that are no longer visible are not silently
    // kept in the set and accidentally included in bulk actions.
    useEffect(() => {
        clearSelection();
    }, [filteredOrders, clearSelection]);

    const handleSearchInputChange = (text: string) => {
        setSearchText(text);
    };

    const searchbar = useRef<HTMLDivElement|null>(null);

    return (
        <div className='orders-list-view'>
            <Card className='border-0'>
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col xs='sm'>
                            <CardTitle
                                tag='h3'
                                className='title-color h6 m-0'
                            >
                                <span>{t('Liste des commandes')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='sm-auto'>
                            <div className='btns-wrapper d-flex gap-2 align-items-center'>
                                {/* View mode toggle — list vs Kanban board */}
                                <ButtonGroup size="sm">
                                    <Button
                                        color={viewMode === 'table' ? 'info2' : 'secondary'}
                                        outline={viewMode !== 'table'}
                                        className="d-flex flex-center gap-1 border-0"
                                        onClick={() => changeViewMode('table')}
                                        title={t('Vue liste')}
                                    >
                                        <ListUl size={14} />
                                    </Button>
                                    <Button
                                        color={viewMode === 'kanban' ? 'info2' : 'secondary'}
                                        outline={viewMode !== 'kanban'}
                                        className="d-flex flex-center gap-1 border-0"
                                        onClick={() => changeViewMode('kanban')}
                                        title={t('Vue Kanban')}
                                    >
                                        <Grid3x3GapFill size={14} />
                                    </Button>
                                </ButtonGroup>
                                <Button
                                    tag='button'
                                    type='button'
                                    color="success"
                                    size='md'
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => goTo('/commandes/nouvelle')}
                                >
                                    <PlusLg />
                                    <span className="d-none d-md-inline">{t('Nouvelle commande')}</span>
                                </Button>
                                <ExportOrdersButton orders={filteredOrders} />
                                <Button
                                    tag='button'
                                    type='button'
                                    color="info2"
                                    size='md'
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => fetchOrders()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>
                <CardHeader className='py-5'>
                    <div className="toolbar orders-list-toolbar">
                        <div className="toolbar-content">
                            <Form>
                                <Row className='align-items-center g-3'>
                                    <Col xl={6}>
                                        <div
                                            ref={searchbar}
                                            className='searchbar'
                                        >
                                            <InputGroup className='input-group-searbar h-40px'>
                                                <InputGroupText
                                                    tag='div'
                                                    className='icon-search-wrapper py-0 pe-1 h-100'
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                                </InputGroupText>
                                                <Input
                                                    type='text'
                                                    placeholder={t('Rechercher')}
                                                    className='search-input searchbar-search-input form-control h-100'
                                                    value={searchedText}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => handleSearchInputChange(e.currentTarget.value)}
                                                    onFocus={() => {
                                                        searchbar.current?.classList.add('focus');
                                                    }}
                                                    onBlur={() => {
                                                        searchbar.current?.classList.remove('focus');
                                                    }}
                                                />
                                                <InputGroupText
                                                    tag='div'
                                                    className='icon-clear-wrapper py-0 pe-1 h-100'
                                                >
                                                    <Button
                                                        tag='button'
                                                        type='button'
                                                        size='sm'
                                                        className={searchedText.length ? 'd-inline-block' : 'd-none'}
                                                        onClick={() => setSearchText('')}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </Button>
                                                </InputGroupText>
                                            </InputGroup>
                                        </div>
                                    </Col>
                                    <Col xl={6}>
                                        <Row className='align-items-center g-3'>
                                            <Col sm={6} md={4} xl={6}>
                                                <OrderStatusesMenu
                                                    selectedStatus={filterStatus}
                                                    setSelectedStatus={setFilterStatus}
                                                />
                                            </Col>
                                            <Col sm={6} md={4} xl={6}>
                                                <LivreurFilterMenu
                                                    selectedLivreur={filterLivreur}
                                                    setSelectedLivreur={setFilterLivreur}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </CardHeader>

                {/* Bulk action toolbar — only rendered when at least one order is selected.
                    Positioned between the filter bar and the content so it stays visually
                    close to the checkboxes without overlapping the table header. */}
                {selectedOrders.size > 0 && (
                    <CardHeader className='py-3 border-top'>
                        <div className="d-flex align-items-center gap-3">
                            <span className="fw-semibold fs-7">
                                {selectedOrders.size} {t('Sélectionnés')}
                            </span>
                            <Button
                                color="info2"
                                size="sm"
                                className="border-0 rounded-1"
                                onClick={() => setShowBulkModal(true)}
                            >
                                {t('Changer le statut')}
                            </Button>
                            <Button
                                color="secondary"
                                size="sm"
                                className="border-0 rounded-1"
                                onClick={clearSelection}
                            >
                                {t('Tout désélectionner')}
                            </Button>
                        </div>
                    </CardHeader>
                )}

                <CardBody className='px-0 pt-0'>
                    {viewMode === 'table' ? (
                        <OrdersList
                            orders={filteredOrders}
                            fromSearch={fromSearch}
                            selectedOrders={selectedOrders}
                            onToggleSelect={toggleSelect}
                        />
                    ) : (
                        <OrdersKanbanView
                            orders={filteredOrders}
                            selectedOrders={selectedOrders}
                            onToggleSelect={toggleSelect}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Bulk status update modal — mounted only when open so that form
                state is fully reset each time the user opens it. */}
            {showBulkModal && (
                <BulkStatusUpdateModal
                    show={showBulkModal}
                    setShow={setShowBulkModal}
                    toggle={toggleBulkModal}
                    orders={selectedOrderObjects}
                    onComplete={clearSelection}
                />
            )}
        </div>
    );
};

export default OrdersListView;
