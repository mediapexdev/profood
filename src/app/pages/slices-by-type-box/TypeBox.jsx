import React from "react";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";


/**
 * 
 * @returns 
 */
const TypeBox = ({type_box}) => {
    /**
     * 
     */
    return(
        <>
            <div className="type-box d-flex flex-wrap flex-sm-nowrap mb-5">
				
				<div className="me-7 mb-4">
					<div className="type-box-image-wrapper">
						<img
                            className="type-box-image"
                            src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + type_box.id + '.jpg')}
						    alt={type_box.wording}
                        />
					</div>
				</div>

				<div className="flex-grow-1 pt-2">
					<div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                        <div className="type-box-infos d-flex flex-column">
                            <div className="type-box-title-wrapper">
							    <h3 className="type-box-title card-title title-color fs-2">{type_box.wording}</h3>
						    </div>
                            <div className="d-flex flex-column flex-wrap">
                                <div className="type-box-slices-number-wrapper d-flex align-items-center">
                                    {/* <span className="svg-icon svg-icon-4 me-1 text-gray-600 text-gray-700-on-dark">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path opacity="0.3" d="M16.5 9C16.5 13.125 13.125 16.5 9 16.5C4.875 16.5 1.5 13.125 1.5 9C1.5 4.875 4.875 1.5 9 1.5C13.125 1.5 16.5 4.875 16.5 9Z" fill="currentColor"></path>
                                            <path d="M9 16.5C10.95 16.5 12.75 15.75 14.025 14.55C13.425 12.675 11.4 11.25 9 11.25C6.6 11.25 4.57499 12.675 3.97499 14.55C5.24999 15.75 7.05 16.5 9 16.5Z" fill="currentColor"></path>
                                            <rect x="7" y="6" width="4" height="4" rx="2" fill="currentColor"></rect>
                                        </svg>
                                    </span> */}
							        <span className="type-box-slices-number content-color font-sm">{type_box.slices_number} découpes</span>
						        </div>
                                <div className="type-box-price-wrapper font-sm d-flex align-items-center">
                                    {/* <span className="svg-icon svg-icon-4 me-1 text-gray-600 text-gray-700-on-dark">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path opacity="0.3" d="M18.0624 15.3453L13.1624 20.7453C12.5624 21.4453 11.5624 21.4453 10.9624 20.7453L6.06242 15.3453C4.56242 13.6453 3.76242 11.4453 4.06242 8.94534C4.56242 5.34534 7.46242 2.44534 11.0624 2.04534C15.8624 1.54534 19.9624 5.24534 19.9624 9.94534C20.0624 12.0453 19.2624 13.9453 18.0624 15.3453Z" fill="currentColor"></path>
                                            <path d="M12.0624 13.0453C13.7193 13.0453 15.0624 11.7022 15.0624 10.0453C15.0624 8.38849 13.7193 7.04535 12.0624 7.04535C10.4056 7.04535 9.06241 8.38849 9.06241 10.0453C9.06241 11.7022 10.4056 13.0453 12.0624 13.0453Z" fill="currentColor"></path>
                                        </svg>
                                    </span> */}
                                    <span>
                                        <span className='type-box-price me-2'>{new Intl.NumberFormat('fr-FR').format(type_box.price)}</span>
                                        <small className='type-box-price-currency'>Fcfa</small>
                                    </span>
							    </div>
                            </div>
                        </div>
                    </div>
				</div>
			</div>
        </>
    );
}

export default TypeBox;
