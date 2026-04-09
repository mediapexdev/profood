import React from "react";
import { Link } from "react-router-dom";

import {
    Container
} from "reactstrap";

import { useTranslation } from "react-i18next";

import Sidebar from "../layout/components/Sidebar";
import Header from "../layout/components/Header";
import Footer from "../layout/components/Footer";
import BoxTypesPageContent from "./BoxTypesPageContent";
import Toast from "../../components/widgets/Toast";

import './BoxTypesPage.css';

/**
 * 
 * @returns 
 */
const BoxTypesPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <Container
            tag='main'
            id="boxTypesPage"
            className="page px-0 h-100"
            fluid={true}
        >
            {/* begin::header */}
            <Header>
                {/* begin::subheader */}
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">Boxes</h2>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item text-gray-700">
                                    <Link
                                        to='/tableau-de-bord'
                                        className='text-gray-700 text-hover-info2 text-decoration-none'
                                    >
                                        <span>{t('Tableau de bord')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700 active">Boxes</li>
                            </ol>
                        </div>
                    </div>
                </div>
                {/* end::subheader */}
            </Header>
            {/* end::header */}
            {/* begin::overlay */}
            <div className="background-overlay"></div>
            {/* end::overlay */}
            {/* begin::sidebar */}
            <Sidebar />
            {/* end::sidebar */}
            {/* begin::page layout */}
            <div
                id="boxTypesPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                <BoxTypesPageContent />
            </div>
            {/* end::page layout */}
            {/* begin::footer */}
            <Footer />
            {/* end::footer */}
            {/* begin::Toast container */}
            <Toast hideProgressBar={true} />
            {/* end::Toast container */}
        </Container>
    );
};

export default BoxTypesPage;
