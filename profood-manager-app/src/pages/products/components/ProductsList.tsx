import React, { useEffect, useState } from 'react';

import {
    Badge,
    Button,
    Table
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import NoProduct from './NoProduct';
import ProductChip from './ProductChip';
import { formatDate, formatNumber } from '../../../helpers/AssetHelpers';
import usePagination from '../../../components/hooks/usePagination';
import Pagination from '../../../components/widgets/Pagination';
import { SliceProps } from '../../../types';
import ProductEditModal from './modals/ProductEditModal';
import ProductDeleteModal from './modals/ProductDeleteModal';

import PromotionPriceDisplay from '../../../components/shared/PromotionPriceDisplay';

import "./ProductsList.css"

/**
 * 
 */
interface ProductsListProps{
    products: SliceProps[];
    fromSearch?: boolean;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const ProductsList: React.FC<ProductsListProps> = ({products, fromSearch = false}: ProductsListProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [rowsPerPage, setRowsPerPage] = useState<number>(Number(localStorage.getItem('productsListPagination')??10));

    /**
     * 
     */
    useEffect(() => {
        const rows = sessionStorage.getItem('productsListPagination');
        setRowsPerPage(rows !== null ? Number(rows) : 10);
    }, []);

    /**
     * 
     */
    const [curentPageNumber, setCurrentPageNumber] = useState<number>(1);

    /**
     * 
     */
    const { pageData, pageCount } = usePagination(products, curentPageNumber, rowsPerPage);

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
    const [productToEdit, setProductToEdit] = useState<SliceProps|null>(null);
    const [productToDelete, setProductToDelete] = useState<SliceProps|null>(null);
    const [showProductEditModal, setShowProductEditModal] = useState<boolean>(false);
    const [showProductDeleteModal, setShowProductDeleteModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleProductEditModal = () => setShowProductEditModal(!showProductEditModal);

    /**
     * 
     * @returns 
     */
    const toggleProductDeleteModal = () => setShowProductDeleteModal(!showProductDeleteModal);

    /**
     * 
     * @returns 
     */
    const onClosedProductEditModal = () => setProductToEdit(null);

    /**
     * 
     * @returns 
     */
    const onClosedProductDeleteModal = () => setProductToDelete(null);

    /**
     * 
     */
    return (
        <div className='products-list'>
        {
            (!pageData.length)
            ?
            <NoProduct fromSearch={fromSearch} />
            :
            <Table
                responsive={true}
                striped={false}
                size='sm'
                className='products-table table-card table-card-bordered w-100 fs-8 align-middle table-cell-dashed gy-4 bg-transparent'
            >
                <thead>
                    <tr>
                        <th className='product ps-4'>{t('Produit')}</th>
                        <th className='category'>{t('Catégorie')}</th>
                        <th className='price'>{t('Prix au détail')}</th>
                        <th className='weight'>{t('Poids')}</th>
                        <th className='available-in-box'>{'Profood Box'}</th>
                        <th className='date-added'>{t("Date d'ajout")}</th>
                        <th className='action pe-4'>{t('Action')}</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageData.map((product) => {
                        return (
                            <tr key={product.id}>
                                <td className='product-cell ps-4'>
                                    <ProductChip product={product} />
                                </td>
                                <td className='category-cell'>
                                    <Badge
                                        color='info'
                                        className='bg-light-info2 text-gray-800 fw-medium'
                                    >
                                        <span>{t(product.category.wording)}</span>
                                    </Badge>
                                </td>
                                <td className='price-cell'>
                                    <PromotionPriceDisplay
                                        price={product.price}
                                        promotionalPrice={product.promotional_price}
                                        isOnPromotion={product.is_on_promotion}
                                        discountPercentage={product.discount_percentage}
                                    />
                                </td>
                                <td className='weight-cell'>
                                {
                                    ((product.weight > 0 &&
                                    <React.Fragment>
                                        <span>{formatNumber(product.weight)}</span>
                                        <small className='ms-1'>Kg</small>
                                    </React.Fragment>)
                                    ||
                                    t('Inconnu'))
                                }
                                </td>
                                <td className='status-cell'>
                                {
                                    (product.available_in_box)
                                    ?
                                    <Badge
                                        color='success'
                                        className='bg-light-success text-gray-800 fw-medium'
                                    >
                                        <span>{t('Oui')}</span>
                                    </Badge>
                                    :
                                    <Badge
                                        color='danger'
                                        className='bg-light-danger text-gray-800 fw-medium'
                                    >
                                        <span>{t('Non')}</span>
                                    </Badge>
                                }
                                </td>
                                <td className='date-cell'>{formatDate(new Date(product.created_at), 'long', '-', false)}</td>
                                <td className='action-cell pe-4'>
                                    <div className='btns-wrapper d-flex flex-center gap-2'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-primary text-info2 btn-edit btn-edit-product border-0'
                                            onClick={() => {
                                                setProductToEdit(product);
                                                setTimeout(() => setShowProductEditModal(true), 0);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='none'
                                            className='bg-hover-light-danger text-danger btn-delete btn-delete-product border-0'
                                            onClick={() => {
                                                setProductToDelete(product);
                                                setTimeout(() => setShowProductDeleteModal(true), 0);
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
                    id='productsListPagination'
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
                productToEdit &&
                <ProductEditModal
                    show={showProductEditModal}
                    setShow={setShowProductEditModal}
                    toggle={toggleProductEditModal}
                    onClosed={onClosedProductEditModal}
                    product={productToEdit}
                />
            }
            {
                productToDelete &&
                <ProductDeleteModal
                    show={showProductDeleteModal}
                    setShow={setShowProductDeleteModal}
                    toggle={toggleProductDeleteModal}
                    onClosed={onClosedProductDeleteModal}
                    product={productToDelete}
                />
            }
            {/* end::Modals */}
        </div>
    );
};

export default ProductsList;
