import React from "react";

import { IonText } from "@ionic/react";

import { useTranslation } from 'react-i18next';

import Layout from "./layout/Layout";

/**
 * 
 * @returns 
 */
const PrivacyPolicyPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    return (
        <Layout
            contentClassName='privacy-policy-content'
            widgetTitle={t("Politique de confidentialité")}
        >
            <IonText>
                <div className="py-4">
                    <p className="fw-semibold">{t('Nous nous engageons à protéger votre vie privée et vos informations personnelles')}.</p>
                    <p>{t('En commandant sur Profood, vous acceptez les pratiques décrites dans cette politique de confidentialité')}.</p>
                    <p>{t('Comme nous continuons à développer nos plateformes digitales (site web et application) et à utiliser des technologies émergentes pour améliorer les services que nous fournissons, cette politique peut changer')}.</p>
                    <p>{t('Nous vous encourageons à consulter cette politique pour comprendre notre politique de confidentialité actuelle')}.</p>
                    <p>{t("Cette politique couvre les informations personnelles que Profood recueille, utilise ou divulgue et définit la manière dont Profood utilisera, gérera et protégera vos informations personnelles lorsque vous utilisez l'application Profood ou tout autre site, service, logiciel ou média géré par Profood")}.</p>
                    <p>{t('Cette politique peut être révisée de temps à autre')}.</p>
                    <p>{t("Il est recommandé de lire attentivement cette politique chaque fois que vous utilisez l'application ou visitez le site web")}.</p>
                    <p>{t('Chez Profood, nous garantissons notre engagement à respecter et à protéger votre vie privée en ligne')}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <span className="icon-wrapper d-inline-block">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-journal-text"
                                viewBox="0 0 16 16"
                            >
                                <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
                                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                            </svg>
                        </span>
                        <h4>{t("Collecte d'informations")}</h4>
                    </div>
                    <p>{t("A chaque fois que vous vous connectez à l'application ou à notre site internet, votre adresse IP (Internet Protocol) est enregistrée sur nos serveurs")}.</p>
                    <p>{t('Votre adresse IP ne révèle aucune autre information que le numéro qui vous a été attribué')}.</p>
                    <p>{t("Nous n'utilisons pas cette technologie pour obtenir des données personnelles à votre insu ou contre votre gré (par exemple, en enregistrant automatiquement les adresses électroniques des visiteurs)")}.</p>
                    <p>{t("Nous ne l'utilisons pas non plus à d'autres fins que pour nous aider à surveiller le trafic sur notre site web et sur l'application ou (en cas d'activité criminelle ou d'utilisation abusive de nos informations) pour coopérer avec les autorités chargées de l'application de la loi")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <span className="icon-wrapper d-inline-block">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-cookie"
                                viewBox="0 0 16 16"
                            >
                                <path d="M6 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m4.5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                <path d="M8 0a7.96 7.96 0 0 0-4.075 1.114q-.245.102-.437.28A8 8 0 1 0 8 0m3.25 14.201a1.5 1.5 0 0 0-2.13.71A7 7 0 0 1 8 15a6.97 6.97 0 0 1-3.845-1.15 1.5 1.5 0 1 0-2.005-2.005A6.97 6.97 0 0 1 1 8c0-1.953.8-3.719 2.09-4.989a1.5 1.5 0 1 0 2.469-1.574A7 7 0 0 1 8 1c1.42 0 2.742.423 3.845 1.15a1.5 1.5 0 1 0 2.005 2.005A6.97 6.97 0 0 1 15 8c0 .596-.074 1.174-.214 1.727a1.5 1.5 0 1 0-1.025 2.25 7 7 0 0 1-2.51 2.224Z"/>
                            </svg>
                        </span>
                        <h4>{t("Cookies")}</h4>
                    </div>
                    <p>{t("Lorsqu'une personne utilise l'application Profood, nous enregistrons des informations et des détails sur le comportement de l'utilisateur")}.</p>
                    <p>{t('Nous utilisons Google Analytics (_utma, _utmb, _utmc, _utmz)')}.</p>
                    <p>{t("Ces cookies sont utilisés pour collecter des informations sur la manière dont les utilisateurs utilisent l'application")}.</p>
                    <p>{t("Nous utilisons ces informations pour compiler des rapports et pour nous aider à améliorer l'application")}.</p>
                    <p>{t("Les cookies collectent des informations sous forme anonyme, notamment le nombre d'utilisateurs de l'application et l'origine des utilisateurs")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <span className="icon-wrapper d-inline-block">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-pencil-square"
                                viewBox="0 0 16 16"
                            >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path
                                    fillRule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                />
                            </svg>
                        </span>
                        <h4>{t("Modifications")}</h4>
                    </div>
                    <p>{t('Nous pouvons modifier la présente politique de confidentialité à tout moment, avec ou sans préavis')}.</p>
                </div>
            </IonText>
        </Layout>
    );
};

export default PrivacyPolicyPage;
