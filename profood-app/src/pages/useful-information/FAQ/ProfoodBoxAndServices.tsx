import React from "react";

import { useTranslation } from "react-i18next";

import FAQModel from "./Model";
import { QuestionAnswer } from "./types";

import './ProfoodBoxAndServices.css';

/**
 * 
 * @returns 
 */
const ProfoodBoxAndServices: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation()

    /**
     * 
     */
    const questionsAnswers: QuestionAnswer[] = [
        {
            question: `${t('En quoi consiste votre service de livraison de boxes de viande')} ?`,
            answer: <div>
                        <p>{t("Profood se spécialise dans la vente de viande fraîche de qualité et d'origine locale directement à votre porte")}.</p>
                        <p>{t("Notre objectif est de rendre votre expérience d'achat de viande pratique et sans tracas")}.</p>
                    </div>
        },
        {
            question: `${t('Quels types de viande proposez-vous')} ?`,
            answer: <div>
                        <p>{t("Nous proposons de la viande de bœuf, de mouton et de volaille avec une large gamme de produits tels que des steaks, des côtelettes, des saucisses, de la viande hachée...")}.</p>
                        <p>{t("Vous avez le choix de prendre ces produits en forme de package (profood box) ou à l'unité")}.</p>
                    </div>
        },
        {
            question: `${t("Vendez-vous des fruits de mer")} ?`,
            answer: <div>
                        <p>{t("Actuellement, nous vendons uniquement de la viande de bœuf, de mouton et de volaille")}.</p>
                        <p>{t("Toutefois, nous envisageons de les inclure dans nos ventes très prochainement")}.</p>
                    </div>
        },
        {
            question: `${t('Comment passer une commande')} ?`,
            answer: <div>
                        <p>{t("Pour passer une commande, parcourez simplement notre sélection de produits, ajoutez les articles souhaités à votre panier, précisez la quantité et vos préférences supplémentaires, puis procédez à la commande au niveau du panier")}.</p>
                        <p>{t('Vous pouvez ajouter ou supprimer des articles, ajuster les quantités et choisir vos coupes préférées pour vous assurer de recevoir exactement ce que vous voulez')}.</p>
                        <p>{t('Suivez les instructions pour finaliser votre commande, en fournissant les détails de livraison')}.</p>
                    </div>
        },
        {
            question: `${t('Proposez-vous des options spéciales pour les restrictions ou préférences alimentaires')} ?`,
            answer: <div>
                        <p>{t("Bien que nous nous concentrions actuellement sur la fourniture d'une sélection diversifiée de viandes de haute qualité, nous explorons continuellement des options pour tenir compte des restrictions et préférences alimentaires")}.</p>
                    </div>
        }
    ];
    return (
        <FAQModel
            widgetTitle={t("FAQ")}
            pageTitle="Profood Box & Services"
            questionsAnswers={questionsAnswers}
        />
    );
};

export default ProfoodBoxAndServices;
