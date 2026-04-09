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

import { CategoryProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';

import './ProductCategoriesMenu.css';

/**
 * 
 */
interface ProductCategoriesMenuProps{
    selectedCategory: CategoryProps|null;
    setSelectedCategory: (category: CategoryProps|null) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const ProductCategoriesMenu: React.FC<ProductCategoriesMenuProps> = ({selectedCategory, setSelectedCategory}: ProductCategoriesMenuProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
     const { categories } = useDataContext();

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
            className='product-categories-menu-dropdown dropdown-center'
        >
            {/* begin::dropdown toggle */}
            <DropdownToggle
                id='productCategoriesMenuToggler'
                className='menu-toggler filters-menu-toggler categories-menu-toggler d-flex flex-center p-0 pe-2 w-100'
                color='light'
            >
                <Input
                    type='button'
                    className='form-control h-100 fs-8'
                    value={(selectedCategory === null) ? t('Tout') : t(categories.find((c) => c.id === selectedCategory.id)?.wording as string)}
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
            <DropdownMenu className='product-categories-dropdown-menu w-100'>
                <DropdownItem
                    header={true}
                    className='d-flex align-items-center text-muted'
                >
                    <span className=''>{t('Catégorie')}</span>
                </DropdownItem>
                <DropdownItem 
                    className='d-flex align-items-center'
                    active={selectedCategory === null}
                    onClick={() => setSelectedCategory(null)}
                >
                    <span className='fs-8'>{t('Tout')}</span>
                </DropdownItem>
                {
                    categories.map((category, index) => (
                        <DropdownItem 
                            key={index}
                            className='d-flex align-items-center'
                            active={selectedCategory !== null && selectedCategory.id === category.id}
                            onClick={() => setSelectedCategory(category)}
                        >
                            <span className='fs-8'>{t(category.wording)}</span>
                        </DropdownItem>
                    ))
                }
            </DropdownMenu>
            {/* end::dropdown menu */}
        </Dropdown>
    );
};

export default ProductCategoriesMenu;
