import React, { useState } from 'react';

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input
} from 'reactstrap';

import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import { OrderStatus } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';

import './OrderStatusesMenu.css';

/**
 * 
 */
interface OrderStatusesMenuProps{
    selectedStatus: OrderStatus|null;
    setSelectedStatus: (status: OrderStatus|null) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const OrderStatusesMenu: React.FC<OrderStatusesMenuProps> = ({selectedStatus, setSelectedStatus}: OrderStatusesMenuProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
     const { orderStatuses } = useDataContext();

    /**
     * 
     */
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    /**
     * 
     */
    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
            className='order-statuses-menu-dropdown dropdown-center'
        >
            {/* begin::dropdown toggle */}
            <DropdownToggle
                id='orderStatusesMenuToggler'
                className='menu-toggler filters-menu-toggler statuses-menu-toggler d-flex flex-center p-0 pe-2 w-100'
                color='light'
            >
                <Input
                    type='button'
                    className='form-control h-100 fs-8'
                    value={(selectedStatus === null) ? t('Tout') : t(orderStatuses.find((s) => s.id === selectedStatus.id)?.wording as string)}
                />
                <span className='icon-wrapper'>
                {
                    dropdownOpen
                    ?
                    <ChevronUp size={12} />
                    :
                    <ChevronDown size={12} />
                }
                </span>
            </DropdownToggle>
            {/* end::dropdown toggle */}
            {/* begin::dropdown menu */}
            <DropdownMenu className='order-statuses-dropdown-menu w-100'>
                <DropdownItem
                    header={true}
                    className='d-flex align-items-center text-muted'
                >
                    <span className=''>{t('Statut')}</span>
                </DropdownItem>
                <DropdownItem 
                    className='d-flex align-items-center'
                    active={selectedStatus === null}
                    onClick={() => setSelectedStatus(null)}
                >
                    <span className='fs-8'>{t('Tout')}</span>
                </DropdownItem>
                {
                    orderStatuses.map((status, index) => (
                        <DropdownItem 
                            key={index}
                            className='d-flex align-items-center'
                            active={selectedStatus !== null && selectedStatus.id === status.id}
                            onClick={() => setSelectedStatus(status)}
                        >
                            <span className='fs-8'>{t(status.wording)}</span>
                        </DropdownItem>
                    ))
                }
            </DropdownMenu>
            {/* end::dropdown menu */}
        </Dropdown>
    );
};

export default OrderStatusesMenu;
