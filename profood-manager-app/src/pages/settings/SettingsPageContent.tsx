import React from "react";

import {
    Card,
    CardBody,
    CardTitle,
    Col,
    Container,
    Row
} from "reactstrap";

import {
    PeopleFill,
    PersonFill,
    TruckFront
} from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import useGoTo from "../../components/hooks/useGoTo";
import { MainMenuItem } from "../layout/components/types";
import { useUserInfosContext } from "../account/components/contexts/UserInfosProvider";

import './SettingsPageContent.css';

/**
 * 
 * @returns 
 */
const SettingsPageContent: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { userRole } = useUserInfosContext();

    /**
     * 
     */
    const mainMenuItems: MainMenuItem[] = [
        // {
        //     title: 'Général',
        //     url: '/parametres/general',
        //     icon: <Tools size={48} />,
        //     className: "general"
        // },
        {
            title: t('Compte utilisateur'),
            url: '/parametres/compte',
            icon: <PersonFill size={48} />,
            className: 'compte-utilisateur'
        },
        // {
        //     title: t('Utilisateurs'),
        //     url: '/parametres/utilisateurs',
        //     icon: <PeopleFill size={48} />,
        //     className: 'utilisateurs'
        // }
    ];
    if(userRole?.wording.toLowerCase() === 'admin' ||
            userRole?.wording.toLowerCase() === 'super admin'){
        mainMenuItems.push({
            title: t('Utilisateurs'),
            url: '/parametres/utilisateurs',
            icon: <PeopleFill size={48} />,
            className: 'utilisateurs'
        });
    }
    if(['admin', 'super admin', 'manager'].includes(userRole?.wording.toLowerCase() as string)){
        mainMenuItems.push({
            title: t('Livraison'),
            url: '/parametres/livraison',
            icon: <TruckFront size={48} />,
            className: 'livraison'
        });
    }

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div
            id="settingsPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                {
                    mainMenuItems.map((menuItem, index) => {
                        return (
                            <Col
                                key={index}
                                xs={12}
                                sm={6}
                                lg={4}
                                xl={4}
                                xxl={3}
                            >
                                <Card
                                    className={`menu-item-card h-100 ${menuItem.className} border-0 shadow`}
                                    role="button"
                                    onClick={() => goTo(`${menuItem.url}`)}
                                >
                                    <CardBody className="pt-10">
                                        <div className="d-flex flex-column flex-center gap-4">
                                            <div className="icon-wrapper">{menuItem.icon}</div>
                                            <div className="d-flex flex-center">
                                                <CardTitle
                                                    tag='h3'
                                                    className="h6 title"
                                                >
                                                    <span className="title-text">{menuItem.title}</span>
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        );
                    })
                }
                </Row>
            </Container>
        </div>
    );
};

export default SettingsPageContent;
