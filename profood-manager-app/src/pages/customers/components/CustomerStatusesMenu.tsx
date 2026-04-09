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

import './CustomerStatusesMenu.css';

/**
 * 
 */
export type CustomerStatus = 'all'|'logged'|'unlogged';

/**
 * 
 */
interface StatusElement {
    name: string;
    value: CustomerStatus;
}

/**
 * 
 */
interface CustomerStatusesMenuProps{
    selectedStatus: CustomerStatus;
    setSelectedStatus: (status: CustomerStatus) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CustomerStatusesMenu: React.FC<CustomerStatusesMenuProps> = ({selectedStatus, setSelectedStatus}: CustomerStatusesMenuProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

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
    const statuses: StatusElement[] = [
        {
            name: t('Tout'),
            value: 'all'
        },
        {
            name: t('Connecté'),
            value: 'logged'
        },
        {
            name: t('Non connecté'),
            value: 'unlogged'
        }
    ];

    /**
     * 
     */
    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
            className='customer-statuses-menu-dropdown dropdown-center'
        >
            {/* begin::dropdown toggle */}
            <DropdownToggle
                id='customerStatusesMenuToggler'
                className='menu-toggler filters-menu-toggler statuses-menu-toggler d-flex flex-center p-0 pe-2 w-100'
                color='light'
            >
                <Input
                    type='button'
                    className='form-control h-100 fs-8'
                    value={statuses.find((s) => s.value === selectedStatus)?.name}
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
            <DropdownMenu className='customer-statuses-dropdown-menu w-100'>
                <DropdownItem
                    header={true}
                    className='d-flex align-items-center text-muted'
                >
                    <span className=''>{t('Statut')}</span>
                </DropdownItem>
                {
                    statuses.map((status, index) => (
                        <DropdownItem
                            key={index}
                            className='d-flex align-items-center'
                            active={selectedStatus === status.value}
                            onClick={() => setSelectedStatus(status.value)}
                        >
                            <span className='fs-8'>{status.name}</span>
                        </DropdownItem>
                    ))
                }
            </DropdownMenu>
            {/* end::dropdown menu */}
        </Dropdown>
    );
};

export default CustomerStatusesMenu;
