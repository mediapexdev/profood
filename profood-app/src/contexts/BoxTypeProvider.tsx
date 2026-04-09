import React, { useCallback, useContext, useState } from 'react';

import { useTranslation } from 'react-i18next';

import useToast from '../components/hooks/useToast';
import { SliceType } from './SliceType';
import BoxTypeContext, { BoxTypeContextType } from './BoxTypeContext';

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
export const useBoxTypeContext = () => useContext(BoxTypeContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const BoxTypeProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [boxTypeName, setBoxTypeName] = useState<string>('');
    const [slices, setSlices] = useState<SliceType[]>([]);
    const [totalNumber, setTotalNumber] = useState<number>(0);
    const [maximumNumber, setMaxNumber] = useState<number>(0);

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * Define the function to add an item to the cart
     *
     * @param itemToAdd 
     */
    const add = useCallback((itemToAdd: SliceType) => {

        // Check if the item is already in the cart
        const sliceIndex = slices.findIndex((slice) => slice.id === itemToAdd.id);

        if (totalNumber < maximumNumber) {

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
        }
        else{
            showToast(`${t('Quantité maximale atteinte')} !`);
        }
    }, [maximumNumber, showToast, slices, totalNumber]);

    /**
     * Define the function to remove an item from the cart
     *
     * @param itemId 
     */
    const remove = useCallback((itemId: number) => {

        const sliceIndex = slices.findIndex((slice) => slice.id === itemId);
        
        if (sliceIndex !== -1) {
            const newSlices = [...slices];

            if (newSlices[sliceIndex].quantity > 1) {
                newSlices[sliceIndex].quantity -= 1;
                setSlices(newSlices);
            }
            else {
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
        return slice?.quantity ? slice.quantity : 0;
    }, [slices]);

    /**
     * 
     * @param max 
     */
    const setMaximumNumber = useCallback((max: number) => {
        setMaxNumber(max);
    }, []);

    /**
     * Define the context value
     */
    const contextValue: BoxTypeContextType = {
        boxTypeName,
        slices,
        totalNumber,
        maximumNumber,
        add,
        clear,
        getQuantity,
        remove,
        setBoxTypeName,
        setMaximumNumber
    };
    return <BoxTypeContext.Provider value={contextValue}>{children}</BoxTypeContext.Provider>;
};

export default BoxTypeProvider;
