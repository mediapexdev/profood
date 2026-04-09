import React, { useState } from "react";

import { 
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Input,
    Row
} from 'reactstrap';

import {
    ArrowLeftShort,
    ArrowRightShort,
    ChevronDown,
    ChevronUp
} from 'react-bootstrap-icons';

import { useTranslation } from "react-i18next";

import "./Pagination.css";

/**
 * 
 */
export interface PaginationProps{
    id: string;
    pageCount : number;
    currentPageNumber: number;
    rowsPerPage: number;
    setCurrentPageNumber: (pageNumber:number) => void;
    setRowsPerPage: (rows:number) => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const Pagination: React.FC<PaginationProps> = ({ id, pageCount,
    currentPageNumber, setCurrentPageNumber, rowsPerPage, setRowsPerPage }: PaginationProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     * @param event 
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const value = parseInt(event.target.value as string);

        if(!isNaN(value) && pageCount > 1 && value >= 1 && value <= pageCount){
            if ((value < currentPageNumber && currentPageNumber !== 1) ||
                    (value > currentPageNumber && currentPageNumber !== pageCount)) {
                setCurrentPageNumber(value);
            }
        }
    };

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
    const availableRowsNumberPerPage:number[] = [5, 10, 25, 50, 100];

    /**
     * 
     */
    return (
        <div
            id={id}
            className='pagination-box pb-4 px-4'
        >
            <Row className="align-items-center g-4">
                {/*  */}
                <Col xs={12} md={6}>
                    <div className="d-flex flex-center justify-content-md-start gap-2 h-40px">
                        <div className="text-wrapper">
                            <span className="fs-8 fw-medium">{t('Nombre de lignes')}:</span>
                        </div>
                        <Dropdown
                            isOpen={dropdownOpen}
                            toggle={toggleDropdown}
                            className='available-rows-number-per-page-dropdown dropdown-center'
                        >
                            {/* begin::dropdown toggle */}
                            <DropdownToggle
                                className='menu-toggler d-flex flex-center p-0 pe-2 w-100 h-40px'
                                color='light'
                            >
                                <Input
                                    type='button'
                                    className='form-control h-100 fs-8'
                                    value={rowsPerPage}
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
                            <DropdownMenu className='available-rows-number-dropdown-menu'>
                            {
                                availableRowsNumberPerPage.map((rowsNumber, index) => (
                                    <DropdownItem 
                                        key={index}
                                        className='d-flex align-items-center'
                                        active={rowsPerPage !== null && rowsPerPage === rowsNumber}
                                        onClick={() => {
                                            setRowsPerPage(rowsNumber);
                                            sessionStorage.setItem(id, rowsNumber.toString());
                                        }}
                                    >
                                        <span className='fs-8'>{rowsNumber}</span>
                                    </DropdownItem>
                                ))
                            }
                            </DropdownMenu>
                            {/* end::dropdown menu */}
                        </Dropdown>
                    </div>
                </Col>
                {/*  */}
                {/*  */}
                <Col xs={12} md={6}>
                    <div className={`pagination h-40px flex-center justify-content-md-end  ${pageCount <= 1 ? 'd-none' : 'd-flex'}`}>
                        <div className="pagination-btn-wrapper d-flex flex-center">
                            <Button
                                tag='button'
                                type='button'
                                size='sm'
                                color='info'
                                className={`btn-bs-light-info2 btn-control btn-previous border-0 ${currentPageNumber <= 1 ? 'd-none' : 'd-flex'}`}
                                onClick={() => {
                                    if (pageCount > 1 && currentPageNumber !== 1) {
                                        setCurrentPageNumber(currentPageNumber - 1);
                                    }
                                }}
                            >
                                <span className='icon-wrapper'>
                                    <ArrowLeftShort size={24} />
                                </span>
                            </Button>
                        </div>
                        <div className="pagination-pages-info d-flex flex-center">
                            <span className="fs-8 fw-medium">Page</span>
                            <Form>
                                <Input
                                    type='number'
                                    className="form-control form-control-sm form-control-solid font-sm fw-medium h-40px"
                                    min={1}
                                    max={pageCount}
                                    value={currentPageNumber}
                                    onChange={handleInputChange}
                                />
                            </Form>
                            <span className="font-sm fw-semibold">
                                <span className="me-3">{t('sur')}</span>
                                <span>{pageCount}</span>
                            </span>
                        </div>
                        <div className="pagination-btn-wrapper d-flex flex-center">
                            <Button
                                tag='button'
                                type='button'
                                size='sm'
                                color='info'
                                className={`btn-bs-light-info2 btn-control btn-next border-0 ${currentPageNumber >= pageCount ? 'd-none' : 'd-flex'}`}
                                onClick={() => {
                                    if (pageCount > 1 && currentPageNumber !== pageCount) {
                                        setCurrentPageNumber(currentPageNumber + 1);
                                    }
                                }}
                            >
                                <span className='icon-wrapper'>
                                    <ArrowRightShort size={24} />
                                </span>
                            </Button>
                        </div>
                    </div>
                </Col>
                {/*  */}
            </Row>
        </div>
    );
};

export default Pagination;
