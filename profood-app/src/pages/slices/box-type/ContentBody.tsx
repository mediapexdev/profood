import React, { useContext } from "react";

import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";

import { SelectedCategoryContext } from "./BoxTypeSlicesPage";
import { useBoxTypeContext } from "../../../contexts/BoxTypeProvider";
import SliceList from "../../../components/slices/SliceList";
import SlicesHandlersContext, { SlicesHandlersContextType } from "../../../contexts/SlicesHandlersContext";
import { useSlicePriceVisibilityContext } from "../../../contexts/SlicePriceVisibilityProvider";
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
    const { setShowPrice } = useSlicePriceVisibilityContext();

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

        setShowPrice(false);
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
    const { add, remove, getQuantity } = useBoxTypeContext();

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
                    (!selectedCategory?.id) ? slicesProps.filter((s) => s.available_in_box) :
                    slicesProps.filter((s) => s.available_in_box && s.category.id === selectedCategory.id)}
                />
                <ConnectionReminderAlert />
            </div>
        </SlicesHandlersContext.Provider>
    );
};

export default ContentBody;
