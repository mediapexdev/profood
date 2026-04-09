import { useState, useEffect } from "react";

/**
 * 
 * @param data 
 * @param rowsPerPage 
 * @returns 
 */
const calculatePageCount = (data: any[], rowsPerPage: number) => {
    return Math.ceil(data.length / rowsPerPage);
};

/**
 * 
 * @param data 
 * @param pageNumber 
 * @param rowsPerPage 
 * @returns 
 */
const sliceData = (data: any[], pageNumber: number, rowsPerPage: number) => {
    return data.slice((pageNumber - 1) * rowsPerPage, pageNumber * rowsPerPage);
};

/**
 * 
 * @param data 
 * @param pageNumber 
 * @param rowsPerPage 
 * @returns 
 */
const usePagination = (data: any[], pageNumber: number, rowsPerPage: number) => {
    /**
     * 
     */
    const [pageCount, setPageCount] = useState<number>(1);

    /**
     * 
     */
    const [pageData, setPageData] = useState<any[]>([]);

    /**
     * 
     */
    useEffect(() => {
        const page_count = calculatePageCount(data, rowsPerPage);
        setPageCount((page_count) ? page_count : 1);

        const slice = sliceData(data, pageNumber, rowsPerPage);
        setPageData([...slice]);
    }, [data, pageNumber, rowsPerPage]);

    return { pageData, pageCount };
};

export default usePagination;
