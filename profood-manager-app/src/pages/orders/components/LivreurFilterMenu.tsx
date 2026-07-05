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

import { Livreur } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';

// Reuses the status menu styling so both order filters look identical.
import './OrderStatusesMenu.css';

/**
 * A filter value: null = every order, 'unassigned' = orders with no delivery
 * person yet, or a specific Livreur.
 */
export type LivreurFilter = Livreur | 'unassigned' | null;

/**
 *
 */
interface LivreurFilterMenuProps {
    selectedLivreur: LivreurFilter;
    setSelectedLivreur: (value: LivreurFilter) => void;
}

/**
 *
 * @param param0
 * @returns
 */
const LivreurFilterMenu: React.FC<LivreurFilterMenuProps> = ({ selectedLivreur, setSelectedLivreur }) => {
    const { t } = useTranslation();
    const { livreurs } = useDataContext();

    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    const livreurName = (livreur: Livreur) =>
        `${livreur.user?.first_name ?? ''} ${livreur.user?.last_name ?? ''}`.trim() || t('Livreur');

    const label =
        selectedLivreur === null
            ? t('Tous les livreurs')
            : selectedLivreur === 'unassigned'
                ? t('À assigner')
                : livreurName(selectedLivreur);

    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
            className='order-statuses-menu-dropdown dropdown-center'
        >
            <DropdownToggle
                className='menu-toggler filters-menu-toggler statuses-menu-toggler d-flex flex-center p-0 pe-2 w-100'
                color='light'
            >
                <Input
                    type='button'
                    className='form-control h-100 fs-8'
                    value={label}
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
            <DropdownMenu className='order-statuses-dropdown-menu w-100'>
                <DropdownItem
                    header={true}
                    className='d-flex align-items-center text-muted'
                >
                    <span>{t('Livreur')}</span>
                </DropdownItem>
                <DropdownItem
                    className='d-flex align-items-center'
                    active={selectedLivreur === null}
                    onClick={() => setSelectedLivreur(null)}
                >
                    <span className='fs-8'>{t('Tous les livreurs')}</span>
                </DropdownItem>
                <DropdownItem
                    className='d-flex align-items-center'
                    active={selectedLivreur === 'unassigned'}
                    onClick={() => setSelectedLivreur('unassigned')}
                >
                    <span className='fs-8'>{t('À assigner')}</span>
                </DropdownItem>
                {
                    livreurs.map((livreur, index) => (
                        <DropdownItem
                            key={index}
                            className='d-flex align-items-center'
                            active={selectedLivreur !== null && selectedLivreur !== 'unassigned' && selectedLivreur.id === livreur.id}
                            onClick={() => setSelectedLivreur(livreur)}
                        >
                            <span className='fs-8'>{livreurName(livreur)}</span>
                        </DropdownItem>
                    ))
                }
            </DropdownMenu>
        </Dropdown>
    );
};

export default LivreurFilterMenu;
