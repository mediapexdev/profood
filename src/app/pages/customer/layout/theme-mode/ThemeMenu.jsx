import React, { useEffect, useState } from "react";

import { ThemeModeComponent } from "./ThemeMode";
import SunIcon from "../../../../components/svg/SunIcon";
import MoonIcon from "../../../../components/svg/MoonIcon";
import ComputerScreenIcon from "../../../../components/svg/ComputerScreenIcon";


/**
 * 
 * @returns 
 */
const ThemeMenu = () => {
    /**
	 * 
	 */
	// const [mode, setMode] = useState(localStorage.getItem('data-theme'));
	const [mode, setMode] = useState(ThemeModeComponent.getMode());
	const [current_mode, changeMode] = useState(ThemeModeComponent.getMode());

    useEffect(() => {
        changeMode(() => {

            // Store mode value in storage
            if(localStorage) {
                // localStorage.setItem('data-theme', mode);
                ThemeModeComponent.setMode(mode);
            }
        });
    });

    /**
     * 
     */
	return (
		<>
            <div
                id="themeMenu"
                className=""
            >
                {/* begin::Menu Toggle */}
                <a
                    href="#"
                    className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {/* begin::Svg Sun Icon */}
                    <span className="svg-icon svg-icon-2 theme-light-show">
                        <SunIcon />
                    </span>
                    {/* end::Svg Sun Icon */}
                    {/* begin::Svg Moon Icon */}
                    <span className="svg-icon svg-icon-2 theme-dark-show">
                        <MoonIcon />
                    </span>
                    {/* end::Svg Moon Icon */}
                </a>
                {/* end::Menu Toggle */}
                {/* begin::Menu */}
                <div
                    className="dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-muted menu-active-bg menu-state-color fw-semibold py-4 fs-base w-175px"
                    data-kt-menu="true"
                    data-kt-element="theme-mode-menu"
                >
                    {/* begin::Menu item */}
                    <div className="menu-item px-3 my-0">
                        <a
                            href="#"
                            className="menu-link px-3 py-2"
                            data-kt-element="mode"
                            data-kt-value="light"
                            onClick={() => setMode('light')}
                        >
                            <span
                                className="menu-icon"
                                data-kt-element="icon"
                            >
                                {/* begin::Svg Sun Icon */}
                                <span className="svg-icon svg-icon-3">
                                    <SunIcon />
                                </span>
                                {/* end::Svg Sun Icon */}
                            </span>
                            <span className="menu-title">Light</span>
                        </a>
                    </div>
                    {/* end::Menu item */}
                    {/* begin::Menu item */}
                    <div className="menu-item px-3 my-0">
                        <a
                            href="#"
                            className="menu-link px-3 py-2"
                            data-kt-element="mode"
                            data-kt-value="dark"
                            onClick={() => setMode('dark')}
                        >
                            <span
                                className="menu-icon"
                                data-kt-element="icon"
                            >
                                {/* begin::Svg Moon Icon */}
                                <span className="svg-icon svg-icon-3">
                                    <MoonIcon />
                                </span>
                                {/* end::Svg Moon Icon */}
                            </span>
                            <span className="menu-title">Dark</span>
                        </a>
                    </div>
                    {/* end::Menu item */}
                    {/* begin::Menu item */}
                    <div className="menu-item px-3 my-0">
                        <a
                            href="#"
                            className="menu-link px-3 py-2"
                            data-kt-element="mode"
                            data-kt-value="system"
                            onClick={() => setMode('system')}
                        >
                            <span
                                className="menu-icon"
                                data-kt-element="icon"
                            >
                                {/* begin::Svg Icon Computer Screen Icon */}
                                <span className="svg-icon svg-icon-3">
                                    <ComputerScreenIcon />
                                </span>
                                {/* end::Svg Computer Screen Icon */}
                            </span>
                            <span className="menu-title">System</span>
                        </a>
                    </div>
                    {/* end::Menu item */}
                </div>
                {/* end::Menu */}
            </div>
		</>
	);
};

export default ThemeMenu;
