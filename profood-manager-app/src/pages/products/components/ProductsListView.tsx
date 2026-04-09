import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    Button,
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

import { ArrowClockwise } from 'react-bootstrap-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import ProductsList from './ProductsList';
import ProductAddModal from './modals/ProductAddModal';
import { CategoryProps, SliceProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';
import ProductStatusesMenu, { ProductStatus } from './ProductStatusesMenu';
import ProductCategoriesMenu from './ProductCategoriesMenu';

import './ProductsListView.css';

/**
 * 
 * @returns 
 */
const ProductsListView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { slices, fetchSlices } = useDataContext();

    /**
     * 
     */
    const [searchedText, setSearchText] = useState<string>('');

    /**
     * 
     */
    const [filterCategory, setFilterCategory] = useState<CategoryProps|null>(null);

    /**
     * 
     */
    const [filterStatus, setFilterStatus] = useState<ProductStatus>(-1);

    /**
     * 
     */
    const [filteredProducts, setFilteredProducts] = useState<SliceProps[]>([]);

    /**
     * 
     */
    const [fromSearch, setFromSearch] = useState<boolean>(false);

    /**
     * 
     * @param product 
     * @returns 
     */
    const checkCategory = useCallback((product: SliceProps) => {
        return filterCategory !== null && product.category.id === filterCategory.id;
    }, [filterCategory]);

    /**
     * 
     * @param product 
     * @returns 
     */
    const checkStatus = useCallback((product: SliceProps) => {
        return (filterStatus && product.available_in_box) ||
                (!filterStatus && !product.available_in_box);
    }, [filterStatus]);

    /**
     * 
     * @param product 
     * @returns 
     */
    const checkSearchedText = useCallback((product: SliceProps) => {

        return (product.wording.toLowerCase().indexOf(searchedText) > -1 ||
                product.price.toString().indexOf(searchedText) > -1 ||
                product.weight.toString().indexOf(searchedText) > -1 ||
                formatDate(new Date(product.created_at), 'long', '-', false).toString().indexOf(searchedText) > -1);
    }, [searchedText]);

    /**
     * 
     */
    useEffect(() => {
        let f_products = filterCategory !== null ? slices.filter(checkCategory) : slices;
        setFromSearch(filterStatus !== null);

        if(filterStatus !== -1){
            f_products = f_products.filter(checkStatus);
            setFromSearch(true);
        }
        if(searchedText.length > 0){
            f_products = f_products.filter(checkSearchedText);
            setFromSearch(true);
        }
        setFilteredProducts(f_products);
        // setFilteredProducts(!searchedText.length ? slices : slices.filter(checkSearchedText));
	}, [slices, searchedText, filterCategory, filterStatus, checkCategory, checkStatus, checkSearchedText]);

    /**
     * 
     * @param text 
     */
    const handleSearchInputChange = (text: string) => {
        setSearchText(text);
    };

    /**
     * 
     */
    const [showProductAddModal, setShowProductAddModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleProductAddModal = () => setShowProductAddModal(!showProductAddModal);

    /**
     * 
     */
    const searchbar = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    return (
        <div className='products-list-view'>
            <Card className='border-0'>
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col xs='sm'>
                            <CardTitle
                                tag='h3'
                                className='title-color h6 m-0'
                            >
                                <span>{t('Liste des produits')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='sm-auto'>
                            {/* begin::Buttons */}
                            <div className='btns-wrapper d-flex gap-2'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className='btn-add btn-add-product fs-8 rounded-1'
                                    onClick={() => setShowProductAddModal(true)}
                                >
                                    <span className='me-2'>
                                        <FontAwesomeIcon icon={faPlus} size='sm' />
                                    </span>
                                    <span>{t('Nouveau produit')}</span>
                                </Button>
                                <Button
                                    tag='button'
                                    type='button'
                                    color="info2"
                                    size='md'
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => fetchSlices()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                            {/* end::Buttons */}
                        </Col>
                    </Row>
                </CardHeader>
                <CardHeader className='py-5'>
                    <div className="toolbar products-list-toolbar">
                        <div className="toolbar-content">
                            <Form>
                                <Row className='align-items-center g-3'>
                                    <Col xl={6}>
                                        {/* begin::Searchbar */}
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
                                        {/* end::Searchbar */}
                                    </Col>
                                    <Col xl={6}>
                                        {/* begin::Filters */}
                                        <Row className='align-items-center g-3'>
                                            <Col sm={6} md={4} xl={6}>
                                                <ProductCategoriesMenu
                                                    selectedCategory={filterCategory}
                                                    setSelectedCategory={setFilterCategory}
                                                />
                                            </Col>
                                            <Col sm={6} md={4} xl={6}>
                                                <ProductStatusesMenu
                                                    selectedStatus={filterStatus}
                                                    setSelectedStatus={setFilterStatus}
                                                />
                                            </Col>
                                        </Row>
                                        {/* end::Filters */}
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className='px-0 pt-0'>
                    <ProductsList
                        products={filteredProducts}
                        fromSearch={fromSearch}
                    />
                </CardBody>
            </Card>
            {/* begin::Modals */}
            <ProductAddModal
                show={showProductAddModal}
                setShow={setShowProductAddModal}
                toggle={toggleProductAddModal}
            />
            {/* end::Modals */}
        </div>
    );
};

export default ProductsListView;
