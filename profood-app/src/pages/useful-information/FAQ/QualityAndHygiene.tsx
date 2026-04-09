import React from "react";

import { useTranslation } from "react-i18next";

import FAQModel from "./Model";
import { QuestionAnswer } from "./types";

import './PaymentsAndRefunds.css';

/**
 * 
 * @returns 
 */
const QualityAndHygiene: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const questionsAnswers: QuestionAnswer[] = [
        {
            question: `${t("Vos produits sont-ils halal")} ?`,
            answer: <div>
                        <p>{t("Oui, absolument")} !</p>
                    </div>
        },
        {
            question: `${t("Quelle est la durée de conservation de la viande Profood")} ?`,
            answer: <div>
                        <p>{t("Tous les produits Profood portent une étiquette de date de péremption (à consommer de préférence avant) qui mentionne la date avant laquelle le produit peut être consommé")}.</p>
                    </div>
        },
        {
            question: `${t("Comment Profood préserve la fraîcheur de la viande")} ?`,
            answer: <div>
                        <p>{t("De l'achat à la livraison, nous avons mis en place une chaîne du froid strictement opérationnelle, qui maintient nos produits entre 1⁰ et 4⁰ Celsius")}.</p>
                        <p>{t("Cela garantit que la viande est toujours fraîche jusqu'à ce qu'elle vous parvienne")}.</p>
                    </div>
        },
        {
            question: `${t("Comment vérifier vos certificats")} ?`,
            answer: <div>
                        <p>{t("Vous pouvez appeler notre service client au +221 77 856 89 89 ou nous écrire à contact@profood.sn pour en savoir plus")}.</p>
                    </div>
        },
        {
            question: `${t("Vos viandes sont-elles traitées avec des antibiotiques et des hormones de croissance")} ?`,
            answer: <div>
                        <p>{t("Non")}. {t("Nous ajoutons simplement de l'amour et de l'attention à notre viande pour la rendre encore plus savoureuse")}.</p>
                    </div>
        }
    ];
    return (
        <FAQModel
            widgetTitle={t("FAQ")}
            pageTitle={`${t("Qualité")} & ${t("Hygiène")}`}
            questionsAnswers={questionsAnswers}
        />
    );
};

export default QualityAndHygiene;
