import React from "react";

import {
    Col,
    Container,
    Row
} from "reactstrap";

import UsersListView from "./components/UsersListView";

import './UsersPageContent.css';

/**
 * 
 * @returns 
 */
const UsersPageContent: React.FC = () => {
    /**
     * 
     */
    return (
        <div
            id="usersPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <UsersListView />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UsersPageContent;
