import React from "react";

import CategoryWidget from "../../../../components/CategoryWidget";

/**
 * 
 * @param {*} params 
 * @returns 
 */
const CategoryListWidget = (params) => {
    /**
     * 
     */
	return (
        <div className="category-list-widget">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 gy-10">
                {
                    params.categoriesList.map((category) => (
                        <div
                            key={category.id}
                            className="col"
                        >
                            <CategoryWidget category={category} />
                        </div>
                    ))
                }
            </div>
        </div>
	);
};

export default CategoryListWidget;
