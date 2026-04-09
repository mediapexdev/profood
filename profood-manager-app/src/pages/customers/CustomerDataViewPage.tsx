import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Container } from "reactstrap";

import { useTranslation } from "react-i18next";

import Sidebar from "../layout/components/Sidebar";
import Header from "../layout/components/Header";
import Footer from "../layout/components/Footer";
import CustomerDataViewPageContent from "./CustomerDataViewPageContent";
import Toast from "../../components/widgets/Toast";
import { CustomerProps } from "../../types";
import { useDataContext } from "../../components/contexts/DataProvider";

import './CustomerDataViewPage.css';

/**
 * 
 * @returns 
 */
const CustomerDataViewPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { id: customerId } = useParams<string>();

    /**
     * 
     */
    const [customer, setCustomer] = useState<CustomerProps|undefined>(undefined);

    /**
     * 
     */
    const {
        customers
    } = useDataContext();

    /**
     * 
     */
    useEffect(() => {
        const _customer = customers.find((c) => c.id === Number(customerId));
        setCustomer(_customer);
    }, [customerId, customers]);

    /**
     * 
     */
    return (
        <Container
            tag='main'
            id="customerDataViewPage"
            className="page px-0 h-100"
            fluid={true}
        >
            {/* begin::header */}
            <Header>
                {/* begin::subheader */}
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{`${('Clients')} - ${t('Aperçu client')}`}</h2>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item text-gray-700">
                                    <Link
                                        to='/tableau-de-bord'
                                        className='text-gray-700 text-hover-info2 text-decoration-none'
                                    >
                                        <span>{('Accueil')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700">
                                    <Link
                                        to='/clients'
                                        className="text-gray-700 text-hover-info2 text-decoration-none"
                                    >
                                        <span>{t('Clients')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700 active">{t('Aperçu')}</li>
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
                id="customerDataViewPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
            { customer && <CustomerDataViewPageContent {...customer} /> }
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

export default CustomerDataViewPage;
