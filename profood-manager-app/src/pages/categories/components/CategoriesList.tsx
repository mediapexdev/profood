import React, { useEffect, useState } from 'react';

import {
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoCategory from './NoCategory';
import CategoryChip from './CategoryChip';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';
import { CategoryProps } from '../../../types';
import CategoryEditModal from './modals/CategoryEditModal';
import CategoryDeleteModal from './modals/CategoryDeleteModal';

import "./CategoriesList.css"

/**
 * 
 */
interface CategoriesListProps{
    categories: CategoryProps[];
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CategoriesList: React.FC<CategoriesListProps> = ({categories, fromSearch = false}: CategoriesListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('categoriesListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('categoriesListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     * 
     */
    const { pageData, pageCount } = usePagination(categories, curentPageNumber, rowsPerPage);

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
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryProps|null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryProps|null>(null);
    const [showCategoryEditModal, setShowCategoryEditModal] = useState<boolean>(false);
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleCategoryEditModal = () => setShowCategoryEditModal(!showCategoryEditModal);

    /**
     * 
     * @returns 
     */
    const toggleCategoryDeleteModal = () => setShowCategoryDeleteModal(!showCategoryDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedCategoryEditModal = () => setCategoryToEdit(null);

    /**
     * 
     * @returns 
     */
    const onClosedCategoryDeleteModal = () => setCategoryToDelete(null);

    /**
     * 
     */
    return (
        <div className='categories-list'>
        {
            (!pageData.length)
            ?
            <NoCategory fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='categories-table table-card table-card-bordered w-100 fs-8 align-middle table-cell-dashed gy-4 bg-transparent'
            >
                <thead>
                    <tr>
                        <th className='category ps-4'>{t('Catégorie')}</th>
                        <th className='product-count'>{t("Produits")}</th>
                        <th className='date-added'>{t("Date d'ajout")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((category) => {
                        return (
                            <tr key={category.id}>
                                <td className='category-cell ps-4'>
                                    <CategoryChip category={category} />
                                </td>
                                <td className='slices-count-cell'>{formatNumber(category.slices_count)}</td>
                                <td className='date-cell'>{formatDate(new Date(category.created_at), 'long', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit btn-edit-category border-0'
                                            onClick={() => {
                                                setCategoryToEdit(category);
                                                setTimeout(() => setShowCategoryEditModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-category border-0'
                                            onClick={() => {
                                                setCategoryToDelete(category);
                                                setTimeout(() => setShowCategoryDeleteModal(true), 0);
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
                    id='categoriesListPagination'
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
                categoryToEdit &&
                <CategoryEditModal
                    show={showCategoryEditModal}
                    setShow={setShowCategoryEditModal}
                    toggle={toggleCategoryEditModal}
                    onClosed={onClosedCategoryEditModal}
                    category={categoryToEdit}
                />
            }
            {
                categoryToDelete &&
                <CategoryDeleteModal
                    show={showCategoryDeleteModal}
                    setShow={setShowCategoryDeleteModal}
                    toggle={toggleCategoryDeleteModal}
                    onClosed={onClosedCategoryDeleteModal}
                    category={categoryToDelete}
                />
            }
            {/* end::Modals */}
        </div>
    );
};

export default CategoriesList;
