import React from "react";
// import Link from "react-router-dom";
import { Outlet, Link } from "react-router-dom";

import {toAbsolutePublicUrl} from './../../../helpers/AssetHelpers';

// import Logo from './../../../assets/images/logos/profood-new.png';
// import Logo from './../../../assets/images/logos/profood-new-noir.png';

const MainMenu = () => {

	return (
		<>
			<nav
                id="mainNavbar"
                className="navbar"
            >
                {/* begin::Navbar container */}
                <div className="container-fluid">
                    <div className="logo-wrapper d-flex align-items-center">
                        <div
                            className="navbar-toggler d-flex flex-column align-items-center justify-content-center"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#mainMenu"
                            aria-controls="mainMenu"
                        >
                            <span className="line"></span>
                            <span className="line"></span>
                            <span className="line"></span>
                        </div>
                        {/* end::Button navbar toggler */}
                        {/* begin::Logo */}
                        <a
                            className="navbar-brand logo-link py-0"
                            href="#"
                        >
                            <img
                                className="logo-img d-block img-fluid"
                                src={toAbsolutePublicUrl('/media/images/logos/profood-new.png')}
                                alt="logo"
                            />
                        </a>
                        {/* end::Logo */}
                    </div>
                    <div
                        id="mainMenu"
                        className="offcanvas offcanvas-start"
                        tabIndex="-1"
                        data-bs-scroll="true"
                        data-bs-backdrop="false"
                        aria-labelledby="offcanvasNavbarLabel"
                    >
                        <div className="offcanvas-header">
                            <h5
                                id="offcanvasNavbarLabel"
                                className="offcanvas-title"
                            >
                                <span>Offcanvas</span>
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="offcanvas"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                                <li className="nav-item">
                                    <Link
                                        className="nav-link active"
                                        to="/"
                                        aria-current="page"
                                    >
                                        <span>Home</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* end::Navbar container */}
            </nav>
            <Outlet /> 
		</>
	);
};

export default MainMenu;
