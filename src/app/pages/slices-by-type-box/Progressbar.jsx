import React from "react";


/**
 * 
 * @returns 
 */
const Progressbar = ({current_value, max_value, min_value}) => {
    /**
     * 
     */
    return(
        <>
            {/* <div className="">Evolution choix: {globalSliceCounter} / {slice_number}</div> */}

            <div className="d-flex align-items-center w-200px w-sm-300px flex-column mt-3">
                <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                    <span className="fw-semibold fs-5 text-gray-700 text-gray-800-on-dark">Evolution choix</span>
                    <span className="fw-bold fs-5">{`${current_value} / ${max_value}`}</span>
                </div>
                <div className="progress h-8px mx-3 w-100 bg-light mb-3">
                    <div
                        className="progress-bar bg-success rounded h-8px"
                        role="progressbar"
                        aria-valuenow={current_value}
                        aria-valuemin={min_value}
                        aria-valuemax={max_value}
                        style={{
                            width: `${current_value}0%`
                        }}
                    ></div>
                </div>
            </div>
        </>
    );
}

export default Progressbar;
