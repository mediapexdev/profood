import React, { useEffect, useState } from 'react';

import {
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoBoxType from './NoBoxType';
import BoxTypeChip from './BoxTypeChip';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';
import { BoxTypeProps } from '../../../types';
import BoxTypeEditModal from './modals/BoxTypeEditModal';
import BoxTypeDeleteModal from './modals/BoxTypeDeleteModal';

import PromotionPriceDisplay from '../../../components/shared/PromotionPriceDisplay';

import "./BoxTypesList.css"

/**
 * 
 */
interface BoxTypesListProps{
    boxTypes: BoxTypeProps[];
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxTypesList: React.FC<BoxTypesListProps> = ({boxTypes, fromSearch = false}: BoxTypesListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('boxTypesListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('boxTypesListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     * 
     */
    const { pageData, pageCount } = usePagination(boxTypes, curentPageNumber, rowsPerPage);

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
    const [boxTypeToEdit, setBoxTypeToEdit] = useState<BoxTypeProps|null>(null);
    const [boxTypeToDelete, setBoxTypeToDelete] = useState<BoxTypeProps|null>(null);
    const [showBoxTypeEditModal, setShowBoxTypeEditModal] = useState<boolean>(false);
    const [showBoxTypeDeleteModal, setShowBoxTypeDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleBoxTypeEditModal = () => setShowBoxTypeEditModal(!showBoxTypeEditModal);

    /**
     * 
     * @returns 
     */
    const toggleBoxTypeDeleteModal = () => setShowBoxTypeDeleteModal(!showBoxTypeDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedBoxTypeEditModal = () => setBoxTypeToEdit(null);

    /**
     * 
     * @returns 
     */
    const onClosedBoxTypeDeleteModal = () => setBoxTypeToDelete(null);

    /**
     * 
     */
    return (
        <div className='boxTypes-list'>
        {
            (!pageData.length)
            ?
            <NoBoxType fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='boxTypes-table table-card table-card-bordered w-100 fs-8 align-middle table-cell-dashed gy-4 bg-transparent'
            >
                <thead>
                    <tr>
                        <th className='box-type ps-4'>Profood Box</th>
                        <th className='capacity'>{t('Capacité')}</th>
                        <th className='price'>{t('Prix')}</th>
                        <th className='date-added'>{t("Date d'ajout")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((boxType) => {
                        return (
                            <tr key={boxType.id}>
                                <td className='boxType-cell ps-4'>
                                    <BoxTypeChip boxType={boxType} />
                                </td>
                                <td className='capacity-cell'>{formatNumber(boxType.capacity)} {t(`produit${boxType.capacity > 1 ? 's' : ''}`)}</td>
                                <td className='price-cell'>
                                    <PromotionPriceDisplay
                                        price={boxType.price}
                                        promotionalPrice={boxType.promotional_price}
                                        isOnPromotion={boxType.is_on_promotion}
                                        discountPercentage={boxType.discount_percentage}
                                    />
                                </td>
                                <td className='date-cell'>{formatDate(new Date(boxType.created_at), 'long', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit btn-edit-boxType border-0'
                                            onClick={() => {
                                                setBoxTypeToEdit(boxType);
                                                setTimeout(() => setShowBoxTypeEditModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-boxType border-0'
                                            onClick={() => {
                                                setBoxTypeToDelete(boxType);
                                                setTimeout(() => setShowBoxTypeDeleteModal(true), 0);
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
                    id='boxTypesListPagination'
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
                boxTypeToEdit &&
                <BoxTypeEditModal
                    show={showBoxTypeEditModal}
                    setShow={setShowBoxTypeEditModal}
                    toggle={toggleBoxTypeEditModal}
                    onClosed={onClosedBoxTypeEditModal}
                    boxType={boxTypeToEdit}
                />
            }
            {
                boxTypeToDelete &&
                <BoxTypeDeleteModal
                    show={showBoxTypeDeleteModal}
                    setShow={setShowBoxTypeDeleteModal}
                    toggle={toggleBoxTypeDeleteModal}
                    onClosed={onClosedBoxTypeDeleteModal}
                    boxType={boxTypeToDelete}
                />
            }
            {/* end::Modals */}
        </div>
    );
};

export default BoxTypesList;
