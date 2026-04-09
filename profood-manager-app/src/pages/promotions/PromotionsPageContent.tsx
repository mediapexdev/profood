import React from "react";
import { Col, Container, Row } from "reactstrap";
import PromotionsListView from "./components/PromotionsListView";

import './PromotionsPageContent.css';

/**
 * Content area for the Promotions management page.
 * Renders inside the shared page layout (Header / Sidebar / Footer) defined
 * in PromotionsPage.tsx. All substantive UI is delegated to PromotionsListView.
 */
const PromotionsPageContent: React.FC = () => {
    return (
        <div
            id="promotionsPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <PromotionsListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PromotionsPageContent;
