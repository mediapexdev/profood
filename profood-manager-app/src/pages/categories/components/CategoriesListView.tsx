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

import CategoriesList from './CategoriesList';
import CategoryAddModal from './modals/CategoryAddModal';
import { CategoryProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';

import './CategoriesListView.css';

/**
 * 
 * @returns 
 */
const CategoriesListView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { categories, fetchCategories } = useDataContext();

    /**
     * 
     */
    const [searchedText, setSearchText] = useState<string>('');

    /**
     * 
     */
    const [filteredCategories, setFilteredCategories] = useState<CategoryProps[]>([]);

    /**
     * 
     */
    const [fromSearch, setFromSearch] = useState<boolean>(false);

    /**
     * 
     * @param category 
     * @returns 
     */
    const checkSearchedText = useCallback((category: CategoryProps) => {
        return (category.wording.toLowerCase().indexOf(searchedText) > -1 ||
                formatDate(new Date(category.created_at), 'long', '-', false).toString().indexOf(searchedText) > -1);
    }, [searchedText]);

    /**
     * 
     */
    useEffect(() => {
        setFilteredCategories(searchedText.length <= 0 ? categories : categories.filter(checkSearchedText));
        setFromSearch(searchedText.length > 0);
	}, [categories, checkSearchedText, searchedText]);

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
    const [showCategoryAddModal, setShowCategoryAddModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleCategoryAddModal = () => setShowCategoryAddModal(!showCategoryAddModal);

    /**
     * 
     */
    const searchbar = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    return (
        <div className='categories-list-view'>
            <Card className='border-0'>
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col xs='sm'>
                            <CardTitle
                                tag='h3'
                                className='title-color h6 m-0'
                            >
                                <span>{t('Liste des catégories de produit')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='sm-auto'>
                            {/* begin::Buttons */}
                            <div className='btns-wrapper d-flex gap-2'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className='btn-add btn-add-category fs-8 rounded-1'
                                    onClick={() => setShowCategoryAddModal(true)}
                                >
                                    <span className='me-2'>
                                        <FontAwesomeIcon icon={faPlus} size='sm' />
                                    </span>
                                    <span>{t('Nouvelle catégorie')}</span>
                                </Button>
                                <Button
                                    tag='button'
                                    type='button'
                                    color="info2"
                                    size='md'
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => fetchCategories()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                            {/* end::Buttons */}
                        </Col>
                    </Row>
                </CardHeader>
                <CardHeader className='py-5'>
                    <div className="toolbar categories-list-toolbar">
                        <div className="toolbar-content">
                            <Form>
                                <Row className='align-items-center g-3'>
                                    <Col md={6}>
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
                                </Row>
                            </Form>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className='px-0 pt-0'>
                    <CategoriesList
                        categories={filteredCategories}
                        fromSearch={fromSearch}
                    />
                </CardBody>
            </Card>
            {/* begin::Modals */}
            <CategoryAddModal
                show={showCategoryAddModal}
                setShow={setShowCategoryAddModal}
                toggle={toggleCategoryAddModal}
            />
            {/* end::Modals */}
        </div>
    );
};

export default CategoriesListView;
