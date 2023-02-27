import React from "react";
import { CartWidget } from "./Cart";
// import Link from "react-router-dom";
// import { Outlet, Link } from "react-router-dom";

const CartWrapper = () => {

	return (
		<>
            {/* begin::CartWrapper Toggle */}
                <div
                    className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary cursor-pointer w-35px h-35px w-md-40px h-md-40px"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#cartWrapper"
                    aria-controls="cartWrapper"
                >
                    {/* begin::Svg Icon | path: /var/www/preview.keenthemes.com/kt-products/docs/metronic/html/releases/2023-01-26-051612/core/html/src/media/icons/duotune/ecommerce/ecm002.svg */}
                    <span className="svg-icon svg-icon-muted svg-icon-2qx theme-light-show">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21 10H13V11C13 11.6 12.6 12 12 12C11.4 12 11 11.6 11 11V10H3C2.4 10 2 10.4 2 11V13H22V11C22 10.4 21.6 10 21 10Z"
                                fill="currentColor"/>
                            <path
                                opacity="0.3"
                                d="M12 12C11.4 12 11 11.6 11 11V3C11 2.4 11.4 2 12 2C12.6 2 13 2.4 13 3V11C13 11.6 12.6 12 12 12Z"
                                fill="currentColor"/>
                            <path
                                opacity="0.3"
                                d="M18.1 21H5.9C5.4 21 4.9 20.6 4.8 20.1L3 13H21L19.2 20.1C19.1 20.6 18.6 21 18.1 21ZM13 18V15C13 14.4 12.6 14 12 14C11.4 14 11 14.4 11 15V18C11 18.6 11.4 19 12 19C12.6 19 13 18.6 13 18ZM17 18V15C17 14.4 16.6 14 16 14C15.4 14 15 14.4 15 15V18C15 18.6 15.4 19 16 19C16.6 19 17 18.6 17 18ZM9 18V15C9 14.4 8.6 14 8 14C7.4 14 7 14.4 7 15V18C7 18.6 7.4 19 8 19C8.6 19 9 18.6 9 18Z"
                                fill="currentColor"/>
                        </svg>
                    </span>
                    {/* end::Svg Icon */}
                    {/* begin::Svg Icon | path: /var/www/preview.keenthemes.com/kt-products/docs/metronic/html/releases/2023-01-26-051612/core/html/src/media/icons/duotune/ecommerce/ecm002.svg */}
                    <span className="svg-icon svg-icon-muted svg-icon-2qx theme-dark-show">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21 10H13V11C13 11.6 12.6 12 12 12C11.4 12 11 11.6 11 11V10H3C2.4 10 2 10.4 2 11V13H22V11C22 10.4 21.6 10 21 10Z"
                                fill="currentColor"/>
                            <path
                                opacity="0.3"
                                d="M12 12C11.4 12 11 11.6 11 11V3C11 2.4 11.4 2 12 2C12.6 2 13 2.4 13 3V11C13 11.6 12.6 12 12 12Z"
                                fill="currentColor"/>
                            <path
                                opacity="0.3"
                                d="M18.1 21H5.9C5.4 21 4.9 20.6 4.8 20.1L3 13H21L19.2 20.1C19.1 20.6 18.6 21 18.1 21ZM13 18V15C13 14.4 12.6 14 12 14C11.4 14 11 14.4 11 15V18C11 18.6 11.4 19 12 19C12.6 19 13 18.6 13 18ZM17 18V15C17 14.4 16.6 14 16 14C15.4 14 15 14.4 15 15V18C15 18.6 15.4 19 16 19C16.6 19 17 18.6 17 18ZM9 18V15C9 14.4 8.6 14 8 14C7.4 14 7 14.4 7 15V18C7 18.6 7.4 19 8 19C8.6 19 9 18.6 9 18Z"
                                fill="currentColor"/>
                        </svg>
                    </span>
                    {/* end::Svg Icon */}
                </div>
            {/* end::CartWrapper Toggle */}
            {/* begin::CartWrapper */}
            <div
                id="cartWrapper"
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                aria-labelledby="offcanvasRightLabel"
            >
                {/* begin::Offcanvas header */}
                <div className="offcanvas-header">
                    <h5
                        id="offcanvasRightLabel"
                        className="offcanvas-title"
                    >
                        <span>CartWrapper</span>
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                {/* end::Offcanvas header */}
                {/* begin::Offcanvas body */}
                <div className="offcanvas-body">
                    <CartWidget />
                </div>
                {/* end::Offcanvas body */}
            </div>
            {/* end::CartWrapper */}
		</>
	);
};

export default CartWrapper;
