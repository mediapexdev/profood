import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import BoxTypesListView from "./components/BoxTypesListView";

import './BoxTypesPageContent.css';

/**
 * 
 * @returns 
 */
const BoxTypesPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="boxTypesPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <BoxTypesListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BoxTypesPageContent;
