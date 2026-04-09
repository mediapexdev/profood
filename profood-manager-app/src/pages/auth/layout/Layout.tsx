import React, { useEffect, useState } from 'react';

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { Alert } from 'reactstrap';
import { useAlertContext } from '../components/contexts/AlertProvider';
import { useThemeModeContext } from '../../../components/contexts/ThemeModeProvider';
import Toast from '../../../components/widgets/Toast';

import './Layout.css';

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const Layout: React.FC<Props> = ({children }: Props) => {
    /**
     * 
     */
    const { showAlert, text: alertText, color: alertColor } = useAlertContext();

    /**
     * 
     */
    const [presentAlert, setPresentAlert] = useState<boolean>(showAlert);

    /**
     * 
     * @returns 
     */
    const dismissAlert = () => setPresentAlert(false);

    /**
     * 
     */
    useEffect(() => {
        setPresentAlert(showAlert);
    }, [showAlert])

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    return (
        <div className='auth-page-content d-flex flex-column align-items-center flex-column-fluid flex-lg-roww'>
            <div className="background-overlay"></div>
            {/*  */}
            <div className="col-logo d-flex flex-center w-lg-50 px-10 pt-15 pt-sm-20">
                <div className="d-flex flex-center flex-lg-start flex-column position-relative">
                    <div className='login-logo-wrapper d-flex flex-center position-relative'>
                        <img
                            className="img-fluid"
                            // src={toAbsolutePublicUrl('/assets/media/images/logos/profood-new.png')}
                            src={toAbsolutePublicUrl(`/assets/media/images/logos/profood-new${themeMode === 'dark' ? '' : '-blanc'}.png`)}
                            alt="Logo"
                        />
                    </div>
                </div>
            </div>
            {/*  */}
            {/*  */}
            <div className="col-form d-flex flex-center w-lg-50 p-10">
                <div className="card rounded-2 translucent-stylee shadoww">
                    <div className="card-body p-10 px-md-15 py-md-12 p-lg-12 px-xl-15 py-xxl-15 p-xxl-20">
                        <div className="text-center">
                            {
                                showAlert &&
                                <Alert
                                    isOpen={presentAlert}
                                    toggle={dismissAlert}
                                    color={alertColor}
                                >
                                {
                                    alertText
                                }
                                </Alert>
                            }
                            {/* <h1 className="fw-semibold fs-3 mb-0">{title}</h1> */}
                        </div>
                        { children }
                    </div>
                </div>
            </div>
            {/*  */}
            <div id="recaptchaContainer"></div>
            {/* begin::Toast container */}
            <Toast hideProgressBar={true} />
            {/* end::Toast container */}
        </div>
    );
};

export default Layout;
