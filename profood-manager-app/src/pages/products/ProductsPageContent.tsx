import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import ProductsListView from "./components/ProductsListView";

import './ProductsPageContent.css';

/**
 * 
 * @returns 
 */
const ProductsPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="productsPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <ProductsListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProductsPageContent;
