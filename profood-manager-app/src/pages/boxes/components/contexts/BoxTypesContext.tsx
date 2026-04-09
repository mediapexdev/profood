import { createContext } from "react";

import { BoxTypeProps } from "../../../../types";

/**
 * 
 */
export interface BoxTypesContextType {
    boxTypeToEdit?: BoxTypeProps;
    boxTypeToDelete?: BoxTypeProps;
    setBoxTypeToEdit: (boxType?: BoxTypeProps) => void;
    setBoxTypeToDelete: (boxType?: BoxTypeProps) => void;
}

/**
 * Create the products context
 */
const BoxTypesContext = createContext<BoxTypesContextType>({
    boxTypeToEdit: undefined,
    boxTypeToDelete: undefined,
    setBoxTypeToEdit: () => {/* */},
    setBoxTypeToDelete: () => {/* */}
});

export default BoxTypesContext;
