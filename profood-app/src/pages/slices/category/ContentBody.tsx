import React, { useContext } from "react";

import SliceList from "../../../components/slices/SliceList";
import { SelectedCategoryContext } from "./CategorySlicesPage";
import { useCategoryContext } from "../../../contexts/CategoryProvider";
import SlicesHandlersContext, { SlicesHandlersContextType } from "../../../contexts/SlicesHandlersContext";
import SlicePriceVisibilityContext from "../../../contexts/SlicePriceVisibilityContext";
import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import { useConnectionReminderAlertContext } from "../../../contexts/ConnectionReminderAlertProvider";
import ConnectionReminderAlert from "../../../components/widgets/ConnectionReminderAlert";
import { useDataContext } from "../../../contexts/DataProvider";

import './ContentBody.css';

/**
 * 
 * @returns 
 */
const ContentBody: React.FC = () => {
    /**
     * 
     */
    const { selectedCategory } = useContext(SelectedCategoryContext);

    /**
     * 
     */
    const { setShowPrice } = useContext(SlicePriceVisibilityContext);

    /**
     * 
     */
    const { slicesProps } = useDataContext();

    /**
     * 
     */
    const { setCanPresent } = useConnectionReminderAlertContext();

    /**
     * 
     */
    useIonViewDidEnter(() => {

        setShowPrice(true);
        const token = localStorage.getItem('token');

        if(!token){
            setCanPresent(true);
        }
    });

    /**
     * 
     */
    useIonViewDidLeave(() => {
        setShowPrice(false);
    });

    /**
     * 
     */
    const { add, remove, getQuantity } = useCategoryContext();

    /**
     * 
     */
    const handlersContext: SlicesHandlersContextType = {
        add,
        remove,
        getQuantity
    };
    return (
        <SlicesHandlersContext.Provider value={handlersContext}>
            <div className="content-body">
                <SliceList slicePropsList={
                    (!selectedCategory?.id) ? slicesProps :
                    slicesProps.filter((s) => s.category.id === selectedCategory.id)}
                />
                <ConnectionReminderAlert />
            </div>
        </SlicesHandlersContext.Provider>
    );
};

export default ContentBody;
