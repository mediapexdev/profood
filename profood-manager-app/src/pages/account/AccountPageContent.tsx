import React from "react";

import {
    Col,
    Container,
    Row,
    TabContent,
    TabPane
} from "reactstrap";

import ProfileDetailsOverview from "./components/ProfileDetailsOverview";
import AccountPageContentHeading from "./components/AccountPageContentHeading";
import ProfileDetailsEditingView from "./components/ProfileDetailsEditingView";
import SignInMethodEditingView from "./components/SignInMethodEditingView";
import { useViewsNavigationContext } from "./components/contexts/ViewsNavigationProvider";

import './AccountPageContent.css';

/**
 * 
 * @returns 
 */
const AccountPageContent: React.FC = () => {
    /**
     * 
     */
    const { currentViewIndex } = useViewsNavigationContext();

    /**
     * 
     */
    return (
        <div
            id="accountPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10"
            >
                <Row className="gy-5">
                    <Col xs={12}>
                        <AccountPageContentHeading />
                    </Col>
                    <Col xs={12}>
                        <TabContent activeTab={`${currentViewIndex}`}>
                            <TabPane tabId='1'>
                                <ProfileDetailsOverview />
                            </TabPane>
                            <TabPane tabId='2'>
                                <ProfileDetailsEditingView />
                                <SignInMethodEditingView />
                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AccountPageContent;
