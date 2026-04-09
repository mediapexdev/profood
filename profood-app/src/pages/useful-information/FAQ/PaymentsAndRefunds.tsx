import React from "react";

import { useTranslation } from "react-i18next";

import FAQModel from "./Model";
import { QuestionAnswer } from "./types";

import './PaymentsAndRefunds.css';

/**
 * 
 * @returns 
 */
const PaymentsAndRefunds: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const questionsAnswers: QuestionAnswer[] = [
        {
            question: `${t("Puis-je payer en espèces")} ?`,
            answer: <div>
                        <p>{t("Oui, nous acceptons le paiement à la livraison")}.</p>
                    </div>
        },
        {
            question: `${t("Y'a t'il une TPS")} ?`,
            answer: <div>
                        <p>{t("Tous nos prix incluent la taxe sur les produits et services")}.</p>
                    </div>
        },
        {
            question: `${t("Puis-je payer par carte de crédit/débit au moment de la livraison")} ?`,
            answer: <div>
                        <p>{t("Non, nous n'acceptons actuellement pas le paiement à la livraison par carte de crédit/débit")}.</p>
                    </div>
        },
        {
            question: `${t("Acceptez-vous les paiements via PayPal")} ?`,
            answer: <div>
                        <p>{t("Non, nous n'acceptons actuellement aucun paiement via PayPal")}.</p>
                    </div>
        },
        {
            question: `${t("Quelles sont les options de paiement en ligne proposées")} ?`,
            answer: <div>
                        <p>{t("Nous acceptons les principales cartes de crédit/débit et les portefeuilles mobiles (wave, orange money, free money...)")}.</p>
                    </div>
        },
        // {
        //     question: `${t("Y'a t'il des frais supplémentaires associés au paiement en ligne")} ?`,
        //     answer: <div>
        //                 <p>{t("Non, aucun frais supplémentaire ne vous sera facturé")}.</p>
        //             </div>
        // },
        // {
        //     question: `${t("Je ne suis pas satisfait du produit")}. ${t("Proposez-vous un remboursement ou un remplacement")} ?`,
        //     answer: <div></div>
        // },
        // {
        //     question: `${t("Combien de temps faut-il pour que le remboursement soit effectué")} ?`,
        //     answer: <div></div>
        // }
    ];
    return (
        <FAQModel
            widgetTitle={t("FAQ")}
            // pageTitle={`${t("Paiements")} & ${t("Remboursements")}`}
            pageTitle={`${t("Paiements")}`}
            questionsAnswers={questionsAnswers}
        />
    );
};

export default PaymentsAndRefunds;
