import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import CustomersListView from "./components/CustomersListView";

import './CustomersPageContent.css';

/**
 * 
 * @returns 
 */
const CustomersPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="customersPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <CustomersListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CustomersPageContent;
