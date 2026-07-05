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

import useGoTo from "../../components/hooks/useGoTo";
import CustomerDataViewPageContentHeading from "./components/CustomerDataViewPageContentHeading";
import CustomerProfileDetailsOverview from "./components/CustomerProfileDetailsOverview";
import CustomerLifetimeStats from "./components/CustomerLifetimeStats";
import CustomerOrderHistory from "./components/CustomerOrderHistory";
import { CustomerProps } from "../../types";

import './CustomerDataViewPageContent.css';

/**
 * 
 * @param customer 
 * @returns 
 */
const CustomerDataViewPageContent: React.FC<CustomerProps> = (customer: CustomerProps) => {
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
            id="customerDataViewPageContent"
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
                                        onClick={() => goTo('/clients')}
                                    >
                                        <ArrowLeft />
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    </Col>
                    <Col xs={12}>
                    { customer && <CustomerDataViewPageContentHeading {...customer} /> }
                    </Col>
                    <Col xs={12}>
                    { customer && <CustomerLifetimeStats {...customer} /> }
                    </Col>
                    <Col xs={12}>
                    { customer && <CustomerProfileDetailsOverview {...customer} /> }
                    </Col>
                    <Col xs={12}>
                    { customer && <CustomerOrderHistory {...customer} /> }
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CustomerDataViewPageContent;
