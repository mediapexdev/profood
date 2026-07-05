import React from "react";

import { Button, Container } from "reactstrap";

import { List } from 'react-bootstrap-icons';

import UserMenu from "../../account/components/UserMenu";
import NewOrderBell from "./NewOrderBell";
import LanguageMenu from "../../../components/others/LanguageMenu";
import FullscreenModeController from "../../../components/widgets/FullscreenModeController";
import ThemeController from "./theme-mode/ThemeController";
import { useSidebarContext } from "../../../components/contexts/SidebarProvider";

import './Header.css';

/**
 * 
 */
interface HeaderProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * 
 * @param props 
 * @returns 
 */
const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
    /**
     * 
     */
    const { toggleSidebar } = useSidebarContext();

    /**
     * 
     */
    return (
        <header
            id="mainHeader"
            className={`${props.className !== undefined ? props.className : ''} d-flex`}
        >
            <Container
                fluid={true}
                className="px-0"
            >
                <div className="toolbar d-flex flex-stack px-4 px-sm-8">
                    <div className="d-flex align-items-center justify-content-start gap-3">
                        <Button
                            tag='button'
                            type='button'
                            size="sm"
                            id='sidebarToggler'
                            color="light"
                            className="d-flex flex-center content-color border-0"
                            onClick={toggleSidebar}
                        >
                            <List />
                        </Button>
                    </div>
                    {/* <div className="title-wrapper mx-auto d-none d-md-block">
                        <h1 className="app-title fs-6 fw-semibold m-0 text-uppercase">Mecanisme de gestion des plaintes - MGP</h1>
                    </div> */}
                    <div className="d-flex align-items-center justify-content-start gap-3">
                        <NewOrderBell />
                        <LanguageMenu />
                        <ThemeController />
                        <FullscreenModeController />
                        <UserMenu />
                    </div>
                </div>
                { props.children }
            </Container>
        </header>
    );
};

export default Header;
