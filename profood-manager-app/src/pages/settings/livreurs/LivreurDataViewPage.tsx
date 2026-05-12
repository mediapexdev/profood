import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Container } from "reactstrap";

import { useTranslation } from "react-i18next";

import Sidebar from "../../layout/components/Sidebar";
import Header from "../../layout/components/Header";
import Footer from "../../layout/components/Footer";
import LivreurDataViewPageContent from "./LivreurDataViewPageContent";
import Toast from "../../../components/widgets/Toast";
import { UserProps } from "../../../types";
import { useDataContext } from "../../../components/contexts/DataProvider";

import './LivreurDataViewPage.css';

const LivreurDataViewPage: React.FC = () => {
    const { id: userId } = useParams<string>();
    const { t } = useTranslation();
    const [user, setUser] = useState<UserProps|undefined>(undefined);
    const { users } = useDataContext();

    useEffect(() => {
        const _user = users.find((u) => u.id === Number(userId));
        setUser(_user);
    }, [userId, users]);

    return (
        <Container
            tag='main'
            id="livreurDataViewPage"
            className="page px-0 h-100"
            fluid={true}
        >
            <Header>
                <div className="page-title-box d-flex align-items-center px-5 px-sm-8 px-xl-10 px-xxl-12 border-top">
                    <div className="d-flex flex-stack w-100">
                        <h2 className="mb-0 fs-7">{`${t('Livreurs')} - ${t('Aperçu')}`}</h2>
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
                                <li className="breadcrumb-item text-gray-700">
                                    <Link
                                        to='/parametres/livreurs'
                                        className="text-gray-700 text-hover-info2 text-decoration-none"
                                    >
                                        <span>{t('Livreurs')}</span>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item text-gray-700 active">{`${t('Aperçu')} ${t('livreur')}`}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </Header>
            <div className="background-overlay"></div>
            <Sidebar />
            <div
                id="livreurDataViewPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                { user && <LivreurDataViewPageContent {...user} /> }
            </div>
            <Footer />
            <Toast hideProgressBar={true} />
        </Container>
    );
};

export default LivreurDataViewPage;
