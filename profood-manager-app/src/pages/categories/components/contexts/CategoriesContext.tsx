import { createContext } from "react";

import { CategoryProps } from "../../../../types";

/**
 * 
 */
export interface CategoriesContextType {
    categoryToEdit?: CategoryProps;
    categoryToDelete?: CategoryProps;
    setCategoryToEdit: (category?: CategoryProps) => void;
    setCategoryToDelete: (category?: CategoryProps) => void;
}

/**
 * Create the products context
 */
const CategoriesContext = createContext<CategoriesContextType>({
    categoryToEdit: undefined,
    categoryToDelete: undefined,
    setCategoryToEdit: () => {/* */},
    setCategoryToDelete: () => {/* */}
});

export default CategoriesContext;
