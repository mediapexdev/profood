import React from "react";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './NoOrderProduct.css';

/**
 * 
 */
interface Prop {
    text: string;
}

/**
 * 
 * @param prop 
 * @returns 
 */
const NoOrderProduct: React.FC<Prop> = (prop: Prop) => {

    return (
        <div className="no-order-product ion-padding">
            <div className="d-flex flex-column flex-center">
                <div className="image-wrapper my-5">
                    <img
                        src={toAbsolutePublicUrl('/media/images/illustrations/empty-cart.svg')}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-row flex-center mb-3">
                    <p className="no-order-product-text text-center">{prop.text}</p>
                </div>
            </div>
        </div>
    );
};

export default NoOrderProduct;
