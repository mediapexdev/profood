import React, { useCallback, useContext, useState } from 'react';

import { SliceType } from './SliceType';
import CategoryContext, { CategoryContextType } from './CategoryContext';

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
export const useCategoryContext = () => useContext(CategoryContext);

/**
 * Create the provider component
 * 
 * @param param0 
 * @returns 
 */
const CategoryProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [slices, setSlices] = useState<SliceType[]>([]);
    const [totalNumber, setTotalNumber] = useState<number>(0);

    /**
     * Define the function to add an item to the cart
     * 
     * @param itemToAdd 
     */
    const add = useCallback((itemToAdd: SliceType) => {
        // Check if the item is already in the cart
        const sliceIndex = slices.findIndex((slice) => slice.id === itemToAdd.id);

        if (sliceIndex === -1) {
            // If the item is not in the cart, add it with a quantity of 1
            setSlices([...slices, { ...itemToAdd, quantity: 1 }]);
        } 
        else {
            // If the item is already in the cart, increase its quantity by 1
            const newSlices = [...slices];
            newSlices[sliceIndex].quantity += 1;
            setSlices(newSlices);
        }
        setTotalNumber(totalNumber + 1);
    }, [slices, totalNumber]);

    /**
     * Define the function to remove an item from the cart
     *
     * @param itemId 
     */
    const remove = useCallback((itemId: number) => {
        const sliceIndex = slices.findIndex((slice) => slice.id === itemId);

        if (sliceIndex !== -1){
            const newSlices = [...slices];

            if(newSlices[sliceIndex].quantity>1){
                newSlices[sliceIndex].quantity -= 1;
                setSlices(newSlices);
            }
            else{
                setSlices((prevSlices) => prevSlices.filter((slice) => slice.id !== itemId));
            }
            setTotalNumber(totalNumber - 1);
        }
    }, [slices, totalNumber]);

    /**
     * Define the function to clear the cart
     */
    const clear = useCallback(() => {
        setSlices([]);
        setTotalNumber(0);
    }, []);

    /**
     * 
     * @param id 
     * @returns 
     */
    const getQuantity = useCallback((id: number) => {
        const slice = slices.find((slice) => slice.id === id);
        return slice?.quantity?slice.quantity:0;
    }, [slices]);

    /**
     * Define the context value
     */
    const contextValue: CategoryContextType = {
        slices,
        totalNumber,
        add,
        remove,
        clear,
        getQuantity
    };
    return <CategoryContext.Provider value={contextValue}>{children}</CategoryContext.Provider>;
};

export default CategoryProvider;
