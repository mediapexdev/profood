import React from "react";
import { CartWidget } from "../../../components/cart/Cart";
// import Link from "react-router-dom";
// import { Outlet, Link } from "react-router-dom";

import {toAbsolutePublicUrl} from './../../../helpers/AssetHelpers';


/**
 * 
 * @returns 
 */
const UserMenu = () => {
    /**
     * 
     */
    const default_avatar = (true) ? 'blank.svg'  : 'blank-dark.svg';

    /**
     * 
     */
	return (
		<>
            {/* begin::Menu Toggle */}
                <div
                    // id="kt_drawer_example_basic_button"
                    className="cursor-pointer symbol symbol-35px symbol-md-40px"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#userMenu"
                    aria-controls="userMenu"
                >
                    <img
                        src={toAbsolutePublicUrl('/media/images/avatars/' + default_avatar)}
                        alt="Avatar"
                        title="Avatar"
                    />
                </div>
            {/* end::Menu Toggle */}
            {/* begin::User Menu */}
            <div
                id="userMenu"
                className="offcanvas offcanvas-end"
                data-bs-scroll="true"
                data-bs-backdrop="false"
                tabIndex="-1"
                aria-labelledby="offcanvasRightLabel"
            >
                {/* begin::Offcanvas header */}
                <div className="offcanvas-header">
                    <h5
                        id="offcanvasRightLabel"
                        className="offcanvas-title"
                    >
                        <span>User menu</span>
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
                <div className="offcanvas-body"><CartWidget /></div>
                {/* end::Offcanvas body */}
            </div>
            {/* end::User Menu */}
		</>
	);
};

export default UserMenu;
