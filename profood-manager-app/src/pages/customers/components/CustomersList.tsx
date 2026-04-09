import React, { useEffect, useState } from 'react';

import {
    Badge,
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoCustomer from './NoCustomer';
import CustomerChip from './CustomerChip';
import CustomerSegmentBadge from './CustomerSegmentBadge';
import CustomerDeleteModal from './modals/CustomerDeleteModal';
import useGoTo from '../../../components/hooks/useGoTo';
import { CustomerProps } from '../../../types';
import { formatDate, formatPhoneNumber } from '../../../helpers/AssetHelpers';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';

import "./CustomersList.css"

/**
 * 
 */
interface CustomersListProps{
    customers: CustomerProps[];
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CustomersList: React.FC<CustomersListProps> = ({customers, fromSearch = false}: CustomersListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('customersListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('customersListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { pageData, pageCount } = usePagination(customers, curentPageNumber, rowsPerPage);

    /**
     * 
     */
    useEffect(() => {
        if(curentPageNumber > pageCount){
            setCurrentPageNumber(pageCount);
        }
    }, [pageCount, curentPageNumber]);

    /**
     * 
     */
    const [customerToDelete, setCustomerToDelete] = useState<CustomerProps|null>(null);
    const [showCustomerDeleteModal, setShowCustomerDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleCustomerDeleteModal = () => setShowCustomerDeleteModal(!showCustomerDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedCustomerDeleteModal = () => setCustomerToDelete(null);

    /**
     * 
     */
    return (
        <div className='customers-list'>
        {
            (!pageData.length)
            ?
            <NoCustomer fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='customers-table table-card align-middle table-cell-dashed gy-4 w-100'
            >
                <thead>
                    <tr>
                        <th className='customer ps-4'>{t('Client(e)')}</th>
                        <th className='segment'>{t('Segment')}</th>
                        <th className='phone-number'>{t('Téléphone')}</th>
                        <th className='email'>{t('Adresse e-mail')}</th>
                        <th className='status px-4'>{t('Statut')}</th>
                        <th className='date-added'>{t("Date d'ajout")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((customer) => {
                        return (
                            <tr key={customer.id}>
                                <td className='customer-cell ps-4'>
                                    <CustomerChip
                                        customer={customer}
                                        url={`/clients/vue/${customer.id}`}
                                    />
                                </td>
                                <td className='segment-cell'>
                                    <CustomerSegmentBadge segment={customer.segment} />
                                </td>
                                <td className='phone-number-cell'>{formatPhoneNumber(customer.user.phone_number)}</td>
                                <td className='email-cell'>{customer.user.email}</td>
                                <td className='status-cell'>
                                {
                                    (customer.user.logged)
                                    ?
                                    <Badge
                                        color='success'
                                        className='badge-status badge-logged bg-light-success fw-medium'
                                    >
                                        <span>{t('Connecté')}</span>
                                    </Badge>
                                    :
                                    <Badge
                                        color='danger'
                                        className='badge-status badge-unlogged bg-light-danger fw-medium'
                                    >
                                        <span>{t('Non Connecté')}</span>
                                    </Badge>
                                }
                                </td>
                                <td className='date-cell'>{formatDate(new Date(customer.created_at), 'medium', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit btn-edit-customer border-0'
                                            onClick={() => {
                                                goTo(`/clients/edition/${customer.id}`);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-customer border-0'
                                            onClick={() => {
                                                setCustomerToDelete(customer);
                                                // setTimeout(() => setShowCustomerDeleteModal(true), 0);
                                                setShowCustomerDeleteModal(true);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </Table>
        }
            {/* begin::pagination */}
            <div className="pagination-box-wrapper mt-5">
                <Pagination
                    id='customersListPagination'
                    pageCount={pageCount}
                    currentPageNumber={curentPageNumber}
                    setCurrentPageNumber={setCurrentPageNumber}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                />
            </div>
            {/* end::pagination */}
            {/* begin::Modals */}
            {
                customerToDelete &&
                <CustomerDeleteModal
                    show={showCustomerDeleteModal}
                    setShow={setShowCustomerDeleteModal}
                    toggle={toggleCustomerDeleteModal}
                    onClosed={onClosedCustomerDeleteModal}
                    customer={customerToDelete}
                />
            }
            {/* end::Modals */}
        </div>
    );
};

export default CustomersList;
