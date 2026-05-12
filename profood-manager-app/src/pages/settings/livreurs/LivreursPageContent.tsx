import React from "react";

import { Col, Container, Row } from "reactstrap";

import { useTranslation } from "react-i18next";

import UsersListView from "../users/components/UsersListView";

import './LivreursPageContent.css';

const LIVREUR_ROLE_CODE = 4;

const LivreursPageContent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div
            id="livreursPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <UsersListView
                            basePath="/parametres/livreurs"
                            roleFilterCode={LIVREUR_ROLE_CODE}
                            title={t('Liste des livreurs')}
                            addLabel={t('Nouveau livreur')}
                            showRole={false}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LivreursPageContent;
