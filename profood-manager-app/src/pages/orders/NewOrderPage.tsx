import React from "react";
import { Link } from "react-router-dom";

import { Container } from "reactstrap";

import { useTranslation } from "react-i18next";

import Sidebar from "../layout/components/Sidebar";
import Header from "../layout/components/Header";
import Footer from "../layout/components/Footer";
import NewOrderPageContent from "./NewOrderPageContent";
import Toast from "../../components/widgets/Toast";

import './NewOrderPage.css';

/**
 * Staff "new order" (phone / walk-in) screen shell.
 */
const NewOrderPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container
            tag='main'
            id="newOrderPage"
            className="page px-0 h-100"
            fluid={true}
        >
            <Header>
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{t('Nouvelle commande')}</h2>
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
                                        to='/commandes'
                                        className="text-gray-700 text-hover-info2 text-decoration-none"
                                    >
                                        <span>{t('Commandes')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700 active">{t('Nouvelle commande')}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </Header>
            <div className="background-overlay"></div>
            <Sidebar />
            <div
                id="newOrderPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                <NewOrderPageContent />
            </div>
            <Footer />
            <Toast hideProgressBar={true} />
        </Container>
    );
};

export default NewOrderPage;
