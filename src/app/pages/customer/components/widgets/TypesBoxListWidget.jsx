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
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 gx-9 gy-9">
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
