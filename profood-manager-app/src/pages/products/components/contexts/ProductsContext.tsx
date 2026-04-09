import { createContext } from "react";

import { SliceProps } from "../../../../types";

/**
 * 
 */
export interface ProductsContextType {
    productToEdit?: SliceProps;
    productToDelete?: SliceProps;
    setProductToEdit: (product?: SliceProps) => void;
    setProductToDelete: (product?: SliceProps) => void;
}

/**
 * Create the products context
 */
const ProductsContext = createContext<ProductsContextType>({
    productToEdit: undefined,
    productToDelete: undefined,
    setProductToEdit: () => {/* */},
    setProductToDelete: () => {/* */}
});

export default ProductsContext;
