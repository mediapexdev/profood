import React from "react";

import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid,
    IonRow
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import Layout from "../layout/Layout";
import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";

import './FAQPage.css';

/**
 * 
 */
interface FAQTopic {
    title: string;
    illustration: string;
    url: string;
}

/**
 * 
 * @returns 
 */
const FAQPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const FAQ_Topics: FAQTopic[] = [
        {
            title: 'Profood Box & Services',
            illustration: 'info.png',
            url: '/faqs/profood-box-and-services'
        },
        {
            title: `${t('Commande')} & ${t('Livraison')}`,
            illustration: 'order.png',
            url: '/faqs/order-and-delivery'
        },
        {
            title: `${t('Compte')} & ${t('Connexion')}`, //t('Compte & Connexion'),
            illustration: 'question-mark.png',
            url: '/faqs/account-and-login'
        },
        {
            // title: `${t('Paiements')} & ${t('Remboursements')}`,
            title: `${t('Paiements')}`,
            illustration: 'atm-card.png',
            url: '/faqs/payments-and-refunds'
        },
        {
            title: `${t('Qualité')} & ${t('Hygiène')}`, //t('Qualité & Hygiène'),
            illustration: 'badge.png',
            url: '/faqs/quality-and-hygiene'
        }
    ];
    return (
        <Layout
            contentClassName='faq-content'
            widgetTitle={t("FAQ")}
        >
            <IonGrid className="FAQTopics-list-widget">
                <IonRow>
                {
                    FAQ_Topics.map((topic, index) => (
                        <IonCol
                            size="12" size-sm="6" size-md='4' size-lg='4' size-xl='3'
                            key={index}
                        >
                            <IonCard
                                button={true}
                                className="FAQTopic-widget card h-100"
                                routerLink={topic.url}
                                routerDirection="forward"
                            >
                                <IonCardHeader className="card-header d-flex flex-row align-items-start justify-content-center">
                                    <div className="FAQTopic-image-wrapper">
                                        <img
                                            className="FAQTopic-image img-fluid"
                                            src={toAbsolutePublicUrl(`/media/images/illustrations/FAQTopics/${topic.illustration}`)}
                                            alt='Illustration'
                                        />
                                    </div>
                                </IonCardHeader>
                                <IonCardContent className="card-body">
                                    <IonCardTitle className="FAQTopic-title FAQTopic-widget-title title-color font-md text-center">{topic.title}</IonCardTitle>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    ))
                }
                </IonRow>
            </IonGrid>
        </Layout>
    );
};

export default FAQPage;
