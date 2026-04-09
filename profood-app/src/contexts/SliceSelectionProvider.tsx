import React, { useCallback, useContext, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import useToast from '../components/hooks/useToast';
import { SliceType } from './SliceType';
import SliceSelectionContext, { SliceSelectionContextType } from './SliceSelectionContext';

/**
 * Props interface for the SliceSelectionProvider component
 */
interface Props {
    children: React.ReactNode;
}

/**
 * Custom hook to access the SliceSelectionContext
 * Provides access to slice selection state and handlers
 *
 * @returns SliceSelectionContext value with slices state and manipulation functions
 */
export const useSliceSelectionContext = () => useContext(SliceSelectionContext);

/**
 * Unified provider component that manages slice selection state.
 * This replaces both BoxTypeProvider and CategoryProvider to reduce context duplication.
 *
 * The provider tracks:
 * - Selected slices with quantities
 * - Total number of selected items
 * - Optional maximum number constraint (for box types)
 * - Optional box type name (for display purposes)
 *
 * This consolidation reduces re-renders and simplifies the component tree.
 *
 * @param {Props} props - Component props containing children
 * @returns Provider component wrapping children with slice selection state
 */
const SliceSelectionProvider = ({ children }: Props) => {
    /**
     * Translation hook for internationalization
     */
    const { t } = useTranslation();

    /**
     * Toast notification hook
     */
    const showToast = useToast();

    /**
     * State management for slice selection
     */
    const [slices, setSlices] = useState<SliceType[]>([]);
    const [totalNumber, setTotalNumber] = useState<number>(0);
    const [maximumNumber, setMaxNumber] = useState<number>(0);
    const [boxTypeName, setBoxTypeName] = useState<string>('');

    /**
     * Adds a slice to the selection or increments its quantity if already selected.
     * For box types with a maximum limit, enforces the constraint and shows a toast.
     *
     * @param itemToAdd - The slice to add with its id
     */
    const add = useCallback((itemToAdd: SliceType) => {
        // Check if the item is already in the selection
        const sliceIndex = slices.findIndex((slice) => slice.id === itemToAdd.id);

        // Enforce maximum limit only if it's set (box type scenario)
        if (maximumNumber > 0 && totalNumber >= maximumNumber) {
            showToast(`${t('Quantité maximale atteinte')} !`);
            return;
        }

        if (sliceIndex === -1) {
            // If the item is not in the selection, add it with a quantity of 1
            setSlices([...slices, { ...itemToAdd, quantity: 1 }]);
        } else {
            // If the item is already in the selection, increase its quantity by 1
            const newSlices = [...slices];
            newSlices[sliceIndex].quantity += 1;
            setSlices(newSlices);
        }
        setTotalNumber(totalNumber + 1);
    }, [maximumNumber, showToast, slices, totalNumber, t]);

    /**
     * Removes a slice from the selection or decrements its quantity.
     * If quantity reaches 0, removes the slice entirely.
     *
     * @param itemId - The id of the slice to remove
     */
    const remove = useCallback((itemId: number) => {
        const sliceIndex = slices.findIndex((slice) => slice.id === itemId);

        if (sliceIndex !== -1) {
            const newSlices = [...slices];

            if (newSlices[sliceIndex].quantity > 1) {
                // Decrement quantity
                newSlices[sliceIndex].quantity -= 1;
                setSlices(newSlices);
            } else {
                // Remove slice entirely if quantity is 1
                setSlices((prevSlices) => prevSlices.filter((slice) => slice.id !== itemId));
            }
            setTotalNumber(totalNumber - 1);
        }
    }, [slices, totalNumber]);

    /**
     * Clears all selected slices and resets the total count.
     * Used when canceling or completing a selection.
     */
    const clear = useCallback(() => {
        setSlices([]);
        setTotalNumber(0);
    }, []);

    /**
     * Gets the quantity of a specific slice in the selection.
     * Returns 0 if the slice is not selected.
     *
     * @param id - The id of the slice to query
     * @returns The quantity of the slice, or 0 if not selected
     */
    const getQuantity = useCallback((id: number) => {
        const slice = slices.find((slice) => slice.id === id);
        return slice?.quantity ? slice.quantity : 0;
    }, [slices]);

    /**
     * Sets the maximum number of slices that can be selected.
     * Used for box types where there's a predefined limit.
     *
     * @param max - The maximum number allowed
     */
    const setMaximumNumber = useCallback((max: number) => {
        setMaxNumber(max);
    }, []);

    /**
     * Context value memoized to prevent unnecessary re-renders.
     * Only updates when the actual state values change.
     */
    const contextValue: SliceSelectionContextType = useMemo(() => ({
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
    }), [
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
    ]);

    return <SliceSelectionContext.Provider value={contextValue}>{children}</SliceSelectionContext.Provider>;
};

export default SliceSelectionProvider;
