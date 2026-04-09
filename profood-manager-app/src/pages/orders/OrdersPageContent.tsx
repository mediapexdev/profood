import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import OrdersListView from "./components/OrdersListView";

import './OrdersPageContent.css';

/**
 * 
 * @returns 
 */
const OrdersPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="ordersPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="p-5 p-sm-8 p-xl-10 px-xxl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <OrdersListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OrdersPageContent;
