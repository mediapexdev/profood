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

import BoxTypesList from './BoxTypesList';
import BoxTypeAddModal from './modals/BoxTypeAddModal';
import { BoxTypeProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';

import './BoxTypesListView.css';

/**
 * 
 * @returns 
 */
const BoxTypesListView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { boxTypes, fetchBoxTypes } = useDataContext();

    /**
     * 
     */
    const [searchedText, setSearchText] = useState<string>('');

    /**
     * 
     */
    const [filteredBoxTypes, setFilteredBoxTypes] = useState<BoxTypeProps[]>([]);

    /**
     * 
     */
    const [fromSearch, setFromSearch] = useState<boolean>(false);

    /**
     * 
     * @param boxType 
     * @returns 
     */
    const checkSearchedText = useCallback((boxType: BoxTypeProps) => {

        return (boxType.wording.toLowerCase().indexOf(searchedText) > -1 ||
                boxType.price.toString().indexOf(searchedText) > -1 ||
                formatDate(new Date(boxType.created_at), 'long', '-', false).toString().indexOf(searchedText) > -1);
    }, [searchedText]);

    /**
     * 
     */
    useEffect(() => {   
        setFilteredBoxTypes(searchedText.length <= 0 ? boxTypes : boxTypes.filter(checkSearchedText));
        setFromSearch(searchedText.length > 0);
	}, [boxTypes, checkSearchedText, searchedText]);

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
    const [showBoxTypeAddModal, setShowBoxTypeAddModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleBoxTypeAddModal = () => setShowBoxTypeAddModal(!showBoxTypeAddModal);

    /**
     * 
     */
    const searchbar = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    return (
        <div className='boxTypes-list-view'>
            <Card className='border-0'>
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col xs='sm'>
                            <CardTitle
                                tag='h3'
                                className='title-color h6 m-0'
                            >
                                <span>{t('Liste des types de Box')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='sm-auto'>
                            {/* begin::Buttons */}
                            <div className='btns-wrapper d-flex gap-2'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className='btn-add btn-add-boxType fs-8 rounded-1'
                                    onClick={() => setShowBoxTypeAddModal(true)}
                                >
                                    <span className='me-2'>
                                        <FontAwesomeIcon icon={faPlus} size='sm' />
                                    </span>
                                    <span>{t('Nouveau Box')}</span>
                                </Button>
                                <Button
                                    tag='button'
                                    type='button'
                                    color="info2"
                                    size='md'
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => fetchBoxTypes()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                            {/* end::Buttons */}
                        </Col>
                    </Row>
                </CardHeader>
                <CardHeader className='py-5'>
                    <div className="toolbar boxTypes-list-toolbar">
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
                    <BoxTypesList
                        boxTypes={filteredBoxTypes}
                        fromSearch={fromSearch}
                    />
                </CardBody>
            </Card>
            {/* begin::Modals */}
            <BoxTypeAddModal
                show={showBoxTypeAddModal}
                setShow={setShowBoxTypeAddModal}
                toggle={toggleBoxTypeAddModal}
            />
            {/* end::Modals */}
        </div>
    );
};

export default BoxTypesListView;
