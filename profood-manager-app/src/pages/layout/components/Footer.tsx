import React from "react";

import { Col, Container, Row } from "reactstrap";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { useThemeModeContext } from "../../../components/contexts/ThemeModeProvider";

import './Footer.css';

interface FooterProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * 
 * @param props 
 * @returns 
 */
const Footer: React.FC<FooterProps> = (props: FooterProps) => {
    /**
     * 
     */
    const year = new Date().getFullYear();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    return (
        <footer
            id="mainFooter"
            className={`${props.className} d-flex`}
        >
            <Container
                fluid={true}
                className="px-0"
            >
                <Row className="align-items-center m-0 h-100">
                    <Col className="col-sm-6">
                        <div className="d-flex flex-row align-items-center">
                            <div>
                                <span>{`${year} ©`}</span>
                            </div>
                            <div>
                                <img
                                    src={toAbsolutePublicUrl(`/assets/media/images/logos/profood-new-${themeMode === 'dark' ? 'blanc' : 'noir'}.png`)}
                                    className="img-fluid ms-1 w-64px"
                                    alt='Logo Profood'
                                />
                            </div>
                        </div>
                    </Col>
                    {/* <Col className="col-sm-6">
                        <div className="d-flex align-items-center justify-content-end">
                            <span>Design &amp; Develop by</span>
                            <img
                                src={toAbsolutePublicUrl('/assets/media/images/logos/logo-mediapex.png')}
                                className="img-fluid ms-1 w-80px"
                                alt='Logo médiapex'
                            />
                        </div>
                    </Col> */}
                </Row>
                { props.children }
            </Container>
        </footer>
    );
};

export default Footer;
