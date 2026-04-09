import React from "react";

import { IonCard, IonCardContent, IonContent, IonPage } from "@ionic/react";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './Layout.css';

/**
 * 
 */
interface Prop {
    children: React.ReactNode;
    showRecaptchaContainer?: boolean;
    recaptchaContainerId?: string;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const Layout: React.FC<Prop> = ({ children, showRecaptchaContainer = false, recaptchaContainerId = 'recaptchaContainer' }: Prop) => {

    return (
        <IonPage>
            <IonContent
                className="auth-page-content ion-padding"
                fullscreen={false}
            >
                <div className="auth-page-content-container d-flex flex-column flex-column-fluid flex-center">
                    {/*  */}
                    <div className="d-flex flex-center logo-col ion-padding pt-xl-6 pt-xxl-10">
                        <div className="d-flex flex-column flex-center">
                            <img
                                className="w-175px w-lg-225px"
                                src={toAbsolutePublicUrl('/media/images/logos/profood-new.png')}
                                alt="Logo"
                            />
                        </div>
                    </div>
                    {/*  */}
                    {/*  */}
                    <div className="d-flex flex-center form-card-wrapper w-100">
                        <IonCard className="form-card card translucent-style rounded-3 w-100 w-md-500px">
                            <IonCardContent className="form-card-content card-body pt-5">
                            { children }
                            </IonCardContent>
                        </IonCard>
                    </div>
                    {/*  */}
                </div>
                {showRecaptchaContainer && <div id={recaptchaContainerId}></div>}
            </IonContent>
        </IonPage>
    );
};

export default Layout;
