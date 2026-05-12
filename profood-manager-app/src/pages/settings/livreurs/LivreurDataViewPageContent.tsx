import React from "react";

import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";

import { ArrowLeft } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import useGoTo from "../../../components/hooks/useGoTo";
import UserDataViewPageContentHeading from "../users/components/UserDataViewPageContentHeading";
import UserProfileDetailsOverview from "../users/components/UserProfileDetailsOverview";
import LivreurStatsCard from "./components/LivreurStatsCard";
import { UserProps } from "../../../types";
import { useDataContext } from "../../../components/contexts/DataProvider";

import './LivreurDataViewPageContent.css';

const LivreurDataViewPageContent: React.FC<UserProps> = (user: UserProps) => {
    const { t } = useTranslation();
    const goTo = useGoTo();

    const { livreurs } = useDataContext();
    const livreur = livreurs.find((l) => l.user_id === user.id);

    return (
        <div
            id="livreurDataViewPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <Card className='border-0'>
                            <CardBody className=''>
                                <div className='d-flex flex-row flex-wrap flex-stack'>
                                    <div className='d-flex align-items-center'>
                                        <Button
                                            tag='button'
                                            type='button'
                                            title={t('Retour')}
                                            color='light'
                                            className="d-flex flex-center gap-1 h-40px"
                                            onClick={() => goTo('/parametres/livreurs')}
                                        >
                                            <ArrowLeft />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12}>
                        { user && <UserDataViewPageContentHeading {...user} /> }
                    </Col>
                    <Col xs={12}>
                        { user && <UserProfileDetailsOverview {...user} /> }
                    </Col>
                    <Col xs={12}>
                        { livreur && <LivreurStatsCard livreurId={livreur.id} /> }
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LivreurDataViewPageContent;
