import React, { useContext } from "react";

import BoxTypeDetails from "./BoxTypeDetails";
import { CurrentBoxTypeContext } from "./BoxTypeSlicesPage";

import './ContentHeader.css';

/**
 * 
 * @returns 
 */
const ContentHeader: React.FC = () => {
    /**
     * 
     */
    const currentBoxType = useContext(CurrentBoxTypeContext);

    /**
     * 
     */
    return (
        <div className="box-type-content-header content-header">
        { currentBoxType && <BoxTypeDetails {...currentBoxType} />}
        </div>
    );
};

export default ContentHeader;
