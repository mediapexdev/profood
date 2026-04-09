import React, { useContext, useState } from "react";

import CategoriesContext, { CategoriesContextType } from "./CategoriesContext";
import { CategoryProps } from "../../../../types";

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useCategoriesContext = () => useContext(CategoriesContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const CategoriesProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryProps|undefined>(undefined);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryProps|undefined>(undefined);

    // useEffect(() => {
    //     alert(categoryToEdit?.wording);
    // }, [categoryToEdit])
    /**
     * Define the context value
     */
    const contextValue: CategoriesContextType = {
        categoryToDelete,
        categoryToEdit,
        setCategoryToDelete,
        setCategoryToEdit
    };
    return <CategoriesContext.Provider value={contextValue}>{children}</CategoriesContext.Provider>;
};

export default CategoriesProvider;
