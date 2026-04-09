import React, { useContext } from "react";

import CategoryDetails from "./CategoryDetails";
import { SelectedCategoryContext } from "./CategorySlicesPage";

import './ContentHeader.css';

/**
 * 
 * @returns 
 */
const ContentHeader: React.FC = () => {
    /**
     * 
     */
    const { selectedCategory } = useContext(SelectedCategoryContext);

    /**
     * 
     */
    return (
        <div className="category-content-header content-header">
        { selectedCategory && <CategoryDetails {...selectedCategory} /> }
        </div>
    );
};

export default ContentHeader;
