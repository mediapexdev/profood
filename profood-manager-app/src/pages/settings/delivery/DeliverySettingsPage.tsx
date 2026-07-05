import React from "react";
import { Link } from "react-router-dom";

import { Container } from "reactstrap";

import { useTranslation } from "react-i18next";

import DeliverySettingsPageContent from "./DeliverySettingsPageContent";
import Footer from "../../layout/components/Footer";
import Header from "../../layout/components/Header";
import Sidebar from "../../layout/components/Sidebar";
import Toast from "../../../components/widgets/Toast";

/**
 * Delivery pricing configuration screen (staff): global default fee and free
 * shipping threshold, plus a per-zone (commune) fee editor.
 */
const DeliverySettingsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container
            tag='main'
            id="deliverySettingsPage"
            className="page px-0 h-100"
            fluid={true}
        >
            <Header>
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{t('Livraison')}</h2>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item text-gray-700">
                                    <Link to='/tableau-de-bord' className='text-gray-700 text-hover-info2 text-decoration-none'>
                                        <span>{t('Tableau de bord')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700">
                                    <Link to='/parametres' className='text-gray-700 text-hover-info2 text-decoration-none'>
                                        <span>{t('Paramètres')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700 active">{t('Livraison')}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </Header>
            <div className="background-overlay"></div>
            <Sidebar />
            <div
                id="deliverySettingsPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                <DeliverySettingsPageContent />
            </div>
            <Footer />
            <Toast hideProgressBar={true} />
        </Container>
    );
};

export default DeliverySettingsPage;
