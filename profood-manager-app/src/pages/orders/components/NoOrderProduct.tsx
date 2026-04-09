import React from "react";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoOrderProduct.css';

/**
 * 
 */
interface Props {
    text : string;
}

/**
 * 
 * @param props
 * @returns 
 */
const NoOrderProduct: React.FC<Props> = (props: Props) => {
    /**
     * 
     */
    return (
        <div className="no-order-product">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/assets/media/images/illustrations/empty-cart.svg')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-row flex-center mb-3">
                    <p className="no-order-product-text text-center">{props.text}</p>
                </div>
            </div>
        </div>
    );
};

export default NoOrderProduct;
