import React from "react";

// import TypeBox from "../../../../components/cards/TypeBox";
import TypeBoxWidget from "../../../../components/TypeBoxWidget";


/**
 * 
 * @param {*} params 
 * @returns 
 */
const TypesBoxListWidget = (params) => {
    /**
     * 
     */
    return (
        <div className="types-box-list-widget">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 row-cols-xl-4 g-10">
                {
                    params.typesBoxList.map((typeBox) => (
                        <div
                            key={typeBox.id}
                            className="col"
                        >
                            <TypeBoxWidget typeBox={typeBox}/>
                        </div>
                    ))
                }
            </div>
        </div>
	);
};

export default TypesBoxListWidget;
