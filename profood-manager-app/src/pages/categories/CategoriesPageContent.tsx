import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import CategoriesListView from "./components/CategoriesListView";

import './CategoriesPageContent.css';

/**
 * 
 * @returns 
 */
const CategoriesPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="categoriesPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <CategoriesListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CategoriesPageContent;
