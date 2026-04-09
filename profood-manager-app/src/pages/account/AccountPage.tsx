import React from "react";
import { Link } from "react-router-dom";

import {
    Container
} from "reactstrap";

import { useTranslation } from "react-i18next";

import AccountPageContent from "./AccountPageContent";
import Footer from "../layout/components/Footer";
import Header from "../layout/components/Header";
import Sidebar from "../layout/components/Sidebar";
import Toast from "../../components/widgets/Toast";
import ViewsNavigationProvider from "./components/contexts/ViewsNavigationProvider";

import './AccountPage.css';

/**
 * 
 * @returns 
 */
const AccountPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    return (
        <ViewsNavigationProvider>
            <Container
                tag='main'
                id="accountPage"
                className="page px-0 h-100"
                fluid={true}
            >
                {/* begin::header */}
                <Header>
                    {/* begin::subheader */}
                    <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                        <div className="d-flex flex-stack w-100">
                            <h2 className="mb-0 fs-7">{t('Compte utilisateur')}</h2>
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
                                    <li className="breadcrumb-item text-gray-700">
                                        <Link
                                            to='/parametres'
                                            className='text-gray-700 text-hover-info2 text-decoration-none'
                                        >
                                            <span>{t('Paramètres')}</span>
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item text-gray-700 active">{t('Mon compte')}</li>
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
                    id="accountPageContainer"
                    className="page-container position-relative d-flex flex-column"
                >
                    <AccountPageContent />
                </div>
                {/* end::page layout */}
                {/* begin::footer */}
                <Footer />
                {/* end::footer */}
                {/* begin::Toast container */}
                <Toast hideProgressBar={true} />
                {/* end::Toast container */}
            </Container>
        </ViewsNavigationProvider>
    );
};

export default AccountPage;
