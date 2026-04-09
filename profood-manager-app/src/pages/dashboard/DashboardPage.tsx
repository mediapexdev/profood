import React from "react";

import { Container } from "reactstrap";

import { useTranslation } from "react-i18next";

import Header from "../layout/components/Header";
import Footer from "../layout/components/Footer";
import DashboardPageContent from "./DashboardPageContent";
import Sidebar from "../layout/components/Sidebar";
import Toast from "../../components/widgets/Toast";

import './DashboardPage.css';

/**
 * 
 * @returns 
 */
const DashboardPage: React.FC = () => {
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
            id="dashboardPage"
            className="page px-0 h-100"
            fluid={true}
        >
            {/* begin::header */}
            <Header>
                {/* begin::subheader */}
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{t('Tableau de bord')}</h2>
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
                id="dashboardPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                <DashboardPageContent />
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

export default DashboardPage;
