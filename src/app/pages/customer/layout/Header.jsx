import React from "react";
import MainMenu from "./MainMenu";
import ThemeMenu from "./theme-mode/ThemeMenu";
import UserMenu from "./UserMenu";
import CartWrapper from "../../../components/cart/CartWrapper";

const Header = () => {

	return (
		<>
			<header
                className="sticky-top shadow"
            >
                <div className="container-fluid">
                    <div
                        id="mainNavWrapper"
                        className="nav-wrapper main-nav-wrapper py-2 py-xl-3 d-flex flex-stack"
                    >
                        <MainMenu />
                        <div className="others-menu-wrapper d-flex flex-row flewx-nowrap align-items-center gap-5">
                            <CartWrapper />
                            <ThemeMenu />
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </header>
		</>
	);
};

export default Header;
