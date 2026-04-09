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

import CustomersList from './CustomersList';
import { CustomerProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';
import { formatDate } from '../../../helpers/AssetHelpers';
import useGoTo from '../../../components/hooks/useGoTo';
import CustomerStatusesMenu, { CustomerStatus } from './CustomerStatusesMenu';

import './CustomersListView.css';

/**
 * 
 * @returns 
 */
const CustomersListView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { customers, fetchCustomers } = useDataContext();

    /**
     * 
     */
    const [searchedText, setSearchText] = useState<string>('');

    /**
     * 
     */
    const [filterStatus, setFilterStatus] = useState<CustomerStatus>('all');

    /**
     * 
     */
    const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([]);

    /**
     * 
     */
    const [fromSearch, setFromSearch] = useState<boolean>(false);

    /**
     * 
     * @param customer 
     * @returns 
     */
    const checkSearchedText = useCallback((customer: CustomerProps) => {

        return (customer.user.first_name.toLowerCase().indexOf(searchedText) > -1 ||
                customer.user.last_name.toLowerCase().indexOf(searchedText) > -1 ||
                `${customer.user.first_name} ${customer.user.last_name}`.toLowerCase().indexOf(searchedText) > -1 ||
                customer.user.phone_number.indexOf(searchedText) > -1 ||
                formatDate(new Date(customer.created_at), 'medium', '-', false).toString().indexOf(searchedText) > -1);
    }, [searchedText]);

    /**
     * 
     * @param customer 
     * @returns 
     */
    const checkStatus = useCallback((customer: CustomerProps) => {
        return (filterStatus === 'logged' && customer.user.logged) ||
                (filterStatus === 'unlogged' && !customer.user.logged);
    }, [filterStatus]);

    /**
     * 
     */
    useEffect(() => {
        let f_customers = filterStatus !== 'all' ? customers.filter(checkStatus) : customers;
        setFromSearch(filterStatus !== 'all');

        if(searchedText.length > 0){
            f_customers = f_customers.filter(checkSearchedText);
            setFromSearch(true);
        }
        setFilteredCustomers(f_customers);
        // setFilteredCustomers(!searchedText.length ? customers : customers.filter(checkSearchedText));
	}, [customers, searchedText, filterStatus, checkStatus, checkSearchedText]);

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
    const searchbar = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div className='customers-list-view'>
            <Card className='border-0'>
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col xs='sm'>
                            <CardTitle
                                tag='h3'
                                className='title-color h6 m-0'
                            >
                                <span>{('Liste des clients')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='sm-auto'>
                            {/* begin::Buttons */}
                            <div className='btns-wrapper d-flex gap-2'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className='btn-add btn-add-customer fs-8 rounded-1 border-0'
                                    onClick={() => goTo('/clients/nouveau')}
                                >
                                    <span className='me-2'>
                                        <FontAwesomeIcon icon={faPlus} size='sm' />
                                    </span>
                                    <span>{t('Nouveau client')}</span>
                                </Button>
                                <Button
                                    tag='button'
                                    type='button'
                                    color="info2"
                                    className="d-flex flex-center gap-2 rounded-1"
                                    onClick={() => fetchCustomers()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                            {/* end::Buttons */}
                        </Col>
                    </Row>
                </CardHeader>
                <CardHeader className='py-5'>
                    <div className="toolbar customers-list-toolbar">
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
                                                <CustomerStatusesMenu
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
                <CardBody className='pt-0 px-0'>
                    <CustomersList
                        customers={filteredCustomers}
                        fromSearch={fromSearch}
                    />
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomersListView;
