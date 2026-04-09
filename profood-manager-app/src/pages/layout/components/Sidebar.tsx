import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
    Container,
    Nav,
    Navbar,
    NavbarBrand,
    NavItem
} from "reactstrap";

import {
    Bag,
    Box,
    Cart,
    Gear,
    Grid,
    People,
    Speedometer2,
    Tag
} from 'react-bootstrap-icons';

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { useSidebarContext } from "../../../components/contexts/SidebarProvider";
import { MainMenuItem } from "./types";

import './Sidebar.css';

/**
 * 
 * @returns 
 */
const Sidebar: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const mainMenuItems: MainMenuItem[] = [
        {
            title: t('Tableau de bord'),
            url: '/tableau-de-bord',
            icon: <Speedometer2 size={16} />
        },
        {
            title: t('Commandes'),
            url: '/commandes',
            icon: <Cart size={16} />
        },
        {
            title: t('Produits'),
            url: '/produits',
            icon: <Bag size={16} />
        },
        {
            title: t('Catégories'),
            url: '/categories',
            icon: <Grid size={16} />
        },
        {
            title: t('Boxes'),
            url: '/boxes/types',
            icon: <Box size={16} />
        },
        {
            title: t('Clients'),
            url: '/clients',
            icon: <People size={16} />
        },
        {
            title: t('Promotions'),
            url: '/promotions',
            icon: <Tag size={16} />
        },
        {
            title: t('Paramètres'),
            url: '/parametres',
            icon: <Gear size={16} />
        }
    ];

    /**
     * 
     */
    const {
        showSidebar,
        toggleSidebar,
        setShowSidebar
    } = useSidebarContext();

    /**
     * 
     */
    const location = useLocation();

    /**
     * 
     */
    return (
        <div
            id="mainSidebar"
            className={`sidebar ${showSidebar ? '_offcanvas' : ''} no-printable`}
        >
            {/* begin::Backdrop */}
            <div
                className="sidebar-backdrop"
                onClick={toggleSidebar}
            ></div>
            {/* end::Backdrop */}
            {/* begin::Navbar */}
            <Navbar className="align-items-start bg-transparent h-100 pt-0">
                <Container fluid={true}>
                    {/* begin::Navbar brand */}
                    <NavbarBrand
                        tag='div'
                        className="h1 mb-8 me-0 position-relative"
                    >
                        <div className='dashboard-logo-wrapper px-5 pt-4 d-flex align-items-center justify-content-start'>
                            <img
                                className="img-fluid w-130px"
                                src={toAbsolutePublicUrl('/assets/media/images/logos/profood-new-blanc.png')}
                                alt="Logo"
                            />
                        </div>
                    </NavbarBrand>
                    {/* end::Navbar brand */}
                    {/* begin::Nav */}
                    <Nav
                        navbar={true}
                        className="me-autoo"
                    >
                    {
                        mainMenuItems.map((item, index) => {
                            return (
                                <NavItem key={index}>
                                    <Link
                                        to={item.url}
                                        className={`nav-link ${location.pathname === item.url || location.pathname.includes(item.url) ? 'active' : ''}`}
                                        onClick={() => setTimeout(() => setShowSidebar(false), 0)}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="d-flex flex-center">{item.icon}</span>
                                            <span>{item.title}</span>
                                        </div>
                                    </Link>
                                </NavItem>
                            );
                        })
                    }
                    </Nav>
                    {/* end::Nav */}
                </Container>
            </Navbar>
            {/* end::Navbar */}
        </div>
    );
};

export default Sidebar;
