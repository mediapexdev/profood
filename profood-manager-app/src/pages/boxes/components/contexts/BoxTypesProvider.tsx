import React, { useContext, useState } from "react";

import BoxTypesContext, { BoxTypesContextType } from "./BoxTypesContext";
import { BoxTypeProps } from "../../../../types";

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
export const useBoxTypesContext = () => useContext(BoxTypesContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const BoxTypesProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [boxTypeToEdit, setBoxTypeToEdit] = useState<BoxTypeProps|undefined>(undefined);
    const [boxTypeToDelete, setBoxTypeToDelete] = useState<BoxTypeProps|undefined>(undefined);

    // useEffect(() => {
    //     alert(boxTypeToEdit?.wording);
    // }, [boxTypeToEdit])
    /**
     * Define the context value
     */
    const contextValue: BoxTypesContextType = {
        boxTypeToDelete,
        boxTypeToEdit,
        setBoxTypeToDelete,
        setBoxTypeToEdit
    };
    return <BoxTypesContext.Provider value={contextValue}>{children}</BoxTypesContext.Provider>;
};

export default BoxTypesProvider;
