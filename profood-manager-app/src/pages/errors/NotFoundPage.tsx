import React, { useEffect } from "react";

import { Container } from "reactstrap";

import Error404 from "./components/Error404";
import { useLoadingSpinnerContext } from "../../components/contexts/LoadingSpinnerProvider";

import './NotFoundPage.css';

/**
 * 
 * @returns 
 */
const NotFoundPage: React.FC = () => {
    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    // setShowSpinner is stable (dispatch reference) — only needs to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        setTimeout(() => {
            setShowSpinner(false)
        }, 1000)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    return (
        <Container
            tag='main'
            id="notFoundPage"
            className="page h-100"
            fluid={true}
        >
             {/* begin::page layout */}
             <div
                id="notFoundPageContainer"
                className="page-container position-relative d-flex flex-column"
            >
                <div
                    id="notFoundPageContent"
                    className="page-content position-relative"
                >
                    <Error404 />
                </div>
            </div>
            {/* end::page layout */}
        </Container>
    );
};

export default NotFoundPage;
