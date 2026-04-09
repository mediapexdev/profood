import React from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Button } from "reactstrap";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { useThemeModeContext } from "../../../components/contexts/ThemeModeProvider";

import './Error404.css';

/**
 * 
 * @returns 
 */
const Error404: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const navigate = useNavigate();

    /**
     * 
     */
    const goBack = () => {
        // navigate.goBack();
        navigate('/');
    };

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    return (
        <div className="error-404 d-flex flex-column py-20">
            <div className="d-flex flex-column flex-center gap-5">
                <div className="image-wrapper">
                    {/* <img
                        className="img-fluid theme-dark-show"
                        src={toAbsolutePublicUrl('/assets/media/images/illustrations/404-error-light.png')}
                        alt="Illustration"
                    />
                    <img
                        className="img-fluid theme-light-show"
                        src={toAbsolutePublicUrl('/assets/media/images/illustrations/404-error-dark.png')}
                        alt="Illustration"
                    /> */}
                    <img
                        className="img-fluid"
                        src={toAbsolutePublicUrl(`/assets/media/images/illustrations/404-error-${themeMode === 'dark' ? 'light' : 'dark'}.png`)}
                        alt="Illustration"
                    />
                </div>
                <div className="d-flex flex-column flex-center mt-10">
                    <div className="btn-wrapper d-flex flex-row flex-nowrap flex-center">
                        <Button
                            tag='button'
                            type='button'
                            // size='default'
                            className='px-8 py-2 w-100 w-sm-400px'
                            onClick={() => goBack()}
                        >
                            <span>{t('Retour')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error404;
