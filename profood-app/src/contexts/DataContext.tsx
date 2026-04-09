import { createContext } from "react";

import { BoxTypeProps } from "../components/box/BoxType";
import { CategoryProps } from "../components/categories/Category";
import { SliceProps } from "../components/slices/Slice";
import { LocalityInfo } from "../pages/cart/components/types";

/**
 * 
 */
export interface DataContextType {
    boxTypesProps: BoxTypeProps[];
    categoriesProps: CategoryProps[];
    localities: LocalityInfo[];
    slicesProps: SliceProps[];
    fetchData: () => void;
    fetchBoxTypesProps: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchCategoriesProps: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchLocalities: (showSpinner?: boolean, spinnerTime?: number) => void;
    fetchSlicesProps: (showSpinner?: boolean, spinnerTime?: number) => void;
    setBoxTypesProps: (boxTypesProps: BoxTypeProps[]) => void;
    setCategoriesProps: (categoriesProps: CategoryProps[]) => void;
    setLocalities: (localities: LocalityInfo[]) => void;
    setSlicesProps: (slicesProps: SliceProps[]) => void;
}

/**
 * Create the data context
*/
const DataContext = createContext<DataContextType>({
    boxTypesProps: [],
    categoriesProps: [],
    localities: [],
    slicesProps: [],
    fetchBoxTypesProps:() => {/* */},
    fetchCategoriesProps:() => {/* */},
    fetchData:() => {/* */},
    fetchLocalities:() => {/* */},
    fetchSlicesProps:() => {/* */},
    setBoxTypesProps: () => {/* */},
    setCategoriesProps: () => {/* */},
    setLocalities: () => {/* */},
    setSlicesProps: () => {/* */}
});

export default DataContext;
