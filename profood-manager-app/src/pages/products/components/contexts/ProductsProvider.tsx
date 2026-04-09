import React, { useContext, useEffect, useState } from "react";

import ProductsContext, { ProductsContextType } from "./ProductsContext";
import { SliceProps } from "../../../../types";

/**
 * 
 */
interface Props {
    children : React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useProductsContext = () => useContext(ProductsContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const ProductsProvider = ({ children } : Props) => {
    /**
     * 
     */
    const [productToEdit, setProductToEdit] = useState<SliceProps|undefined>(undefined);
    const [productToDelete, setProductToDelete] = useState<SliceProps|undefined>(undefined);

    // useEffect(() => {
    //     alert(productToEdit?.wording);
    // }, [productToEdit])
    /**
     * Define the context value
     */
    const contextValue : ProductsContextType = {
        productToDelete,
        productToEdit,
        setProductToDelete,
        setProductToEdit
    };

    /**
     * 
     */
    return <ProductsContext.Provider value={contextValue}>{children}</ProductsContext.Provider>;
};

export default ProductsProvider;
