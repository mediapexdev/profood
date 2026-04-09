import React, { useEffect, useState } from 'react';

import {
    Badge,
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoUser from './NoUser';
import UserChip from './UserChip';
import UserDeleteModal from './modals/UserDeleteModal';
import useGoTo from '../../../../components/hooks/useGoTo';
import { UserProps } from '../../../../types';
import { formatDate, formatPhoneNumber } from '../../../../helpers/AssetHelpers';
import usePagination from '../../../../components/hooks/usePagination';
import Pagination from '../../../../components/widgets/Pagination';

import "./UsersList.css"

/**
 * 
 */
interface UsersListProps{
    users: UserProps[];
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const UsersList: React.FC<UsersListProps> = ({users, fromSearch}: UsersListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('usersListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('usersListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     * 
     */
    const { pageData, pageCount } = usePagination(users, curentPageNumber, rowsPerPage);

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
    const [userToDelete, setUserToDelete] = useState<UserProps|null>(null);
    const [showUserDeleteModal, setShowUserDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleUserDeleteModal = () => setShowUserDeleteModal(!showUserDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedUserDeleteModal = () => setUserToDelete(null);

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div className='users-list'>
        {
            (!pageData.length)
            ?
            <NoUser fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='users-table table-card align-middle table-cell-dashed gy-4 w-100'
            >
                <thead>
                    <tr>
                        <th className='user ps-4'>{t('Utilisateur')}</th>
                        <th className='role px-4'>Role</th>
                        <th className='phone-number'>{t('Téléphone')}</th>
                        <th className='email'>{t('Adresse e-mail')}</th>
                        <th className='status px-4'>{t('Statut')}</th>
                        <th className='date-added'>{t("Date d'ajout")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((user) => {
                        return (
                            <tr key={user.id}>
                                <td className='user-cell ps-4'>
                                    <UserChip
                                        user={user}
                                        url={`/parametres/utilisateurs/vue/${user.id}`}
                                    />
                                </td>
                                <td className='role-cell'>
                                    <Badge
                                        color='info'
                                        className='badge-role bg-light-info fw-medium'
                                    >
                                        <span>{t(user.role.wording)}</span>
                                    </Badge>
                                </td>
                                <td className='phone-number-cell'>{formatPhoneNumber(user.phone_number)}</td>
                                <td className='email-address-cell'>{user.email}</td>
                                <td className='status-cell'>
                                {
                                    (user.logged)
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
                                <td className='date-cell'>{formatDate(new Date(user.created_at), 'medium', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit btn-edit-user border-0'
                                            onClick={() => {
                                                goTo(`/parametres/utilisateurs/edition/${user.id}`);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-user border-0'
                                            onClick={() => {
                                                setUserToDelete(user);
                                                // setTimeout(() => setShowCustomerDeleteModal(true), 0);
                                                setShowUserDeleteModal(true);
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
                    id='usersListPagination'
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
                userToDelete &&
                <UserDeleteModal
                    show={showUserDeleteModal}
                    setShow={setShowUserDeleteModal}
                    toggle={toggleUserDeleteModal}
                    onClosed={onClosedUserDeleteModal}
                    user={userToDelete}
                />
            }
            {/* end::Modals */}
        </div>
    );
};

export default UsersList;
