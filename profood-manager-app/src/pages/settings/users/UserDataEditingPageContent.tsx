import React from "react";

import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row
} from "reactstrap";

import { ArrowLeft } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import useGoTo from "../../../components/hooks/useGoTo";
import UserDataEditingFormView from "./components/UserProfileDetailsEditingFormView";
import UserPasswordEditingFormView from "./components/UserPasswordEditingFormView";
import UserAccountActivationToggleFormView from "./components/UserAccountActivationToggleFormView";
import { UserProps } from "../../../types";

import './UserDataEditingPageContent.css';

/**
 * 
 * @param user 
 * @returns 
 */
const UserDataEditingPageContent: React.FC<UserProps> = (user: UserProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <div
            id="userDataEditingPageContent"
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
                                <div className='d-flex align-items-center gap-2'>
                                    <Button
                                        tag='button'
                                        type='button'
                                        title={t('Retour')}
                                        color='light'
                                        className="d-flex flex-center gap-1 h-40px"
                                        onClick={() => goTo('/parametres/utilisateurs')}
                                    >
                                        <ArrowLeft />
                                    </Button>
                                </div>
                            </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12}>
                        <UserDataEditingFormView {...user} />
                    </Col>
                    <Col xs={12}>
                        <UserPasswordEditingFormView {...user} />
                    </Col>
                    <Col xs={12}>
                        <UserAccountActivationToggleFormView {...user} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserDataEditingPageContent;
