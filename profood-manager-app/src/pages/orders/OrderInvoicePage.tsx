import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    Container
} from "reactstrap";

import { useTranslation } from "react-i18next";

import Sidebar from "../layout/components/Sidebar";
import Header from "../layout/components/Header";
import Footer from "../layout/components/Footer";
import OrderInvoicePageContent from "./OrderInvoicePageContent";
import Toast from "../../components/widgets/Toast";
import { OrderProps } from "../../types";
import { useDataContext } from "../../components/contexts/DataProvider";
import NotFoundPage from "../errors/NotFoundPage";

import './OrderInvoicePage.css';

/**
 *
 * @returns
 */
const OrderInvoicePage: React.FC = () => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const { id: orderId } = useParams<string>();

    /**
     *
     */
    const [order, setOrder] = useState<OrderProps|undefined>(undefined);
    const [isReady, setIsReady] = useState<boolean>(false);

    /**
     *
     */
    const {
        orders
    } = useDataContext();

    /**
     *
     */
    useEffect(() => {
        if (orders.length > 0) {
            const _order = orders.find((o) => o.string_id === orderId);
            setOrder(_order);
            setIsReady(true);
        }
    }, [orderId, orders]);

    /**
     * Wait for orders to load before deciding
     */
    if (!isReady) {
        return null;
    }

    /**
     *
     */
    if(!order || order.payment_status.code !== 8 ||
        order.status.wording.toLowerCase() !== 'delivered'){
            return <NotFoundPage />
    }
    return (
        <Container
            tag='main'
            id="orderInvoicePage"
            className="page px-0 h-100"
            fluid={true}
        >
            {/* begin::header */}
            <Header className="no-printable">
                {/* begin::subheader */}
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{`${t('Commandes')} - ${order?.string_id}`}</h2>
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
                                <li className="breadcrumb-item text-gray-700 active">{order?.string_id}</li>
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
                id="orderInvoicePageContainer"
                className="page-container position-relative d-flex flex-column"
            >
            { order && <OrderInvoicePageContent {...order} /> }
            </div>
            {/* end::page layout */}
            {/* begin::footer */}
            <Footer className="no-printable" />
            {/* end::footer */}
            {/* begin::Toast container */}
            <Toast hideProgressBar={true} />
            {/* end::Toast container */}
        </Container>
    );
};

export default OrderInvoicePage;
