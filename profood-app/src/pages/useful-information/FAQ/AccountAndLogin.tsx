import React from "react";

import { useTranslation } from "react-i18next";

import FAQModel from "./Model";
import { QuestionAnswer } from "./types";

import './AccountAndLogin.css';

/**
 * 
 * @returns 
 */
const AccountAndLogin: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const questionsAnswers: QuestionAnswer[] = [
        {
            question: `${t("Dois-je m'inscrire ou créer un compte avant d'effectuer un achat")} ?`,
            answer: <div>
                        <p>{t("Oui, vous devez vous inscrire au préalable pour pouvoir effectuer un achat")}.</p>
                        <p>{t("Si vous êtes un ancien utilisateur, vous pouvez utiliser votre numéro de téléphone et votre mot de passe déjà utilisés pour vous connecter à l'application")}.</p>
                        <p>{t("Pour plus d'assistance, veuillez contacter le service client au +221 77 856 89 89")}.</p>
                    </div>
        },
        {
            question: `${t("J'ai oublié mon mot de passe")}. ${t("Comment puis-je le réinitialiser")} ?`,
            answer: <div>
                        <p>{t("Vous pouvez facilement réinitialiser votre mot de passe en cliquant sur “Mot de passe oublié” sur l'écran de connexion et en suivant les étapes")}.</p>
                        <p>{t("Pour toute autre question, vous pouvez contacter le service client au +221 77 856 89 89 ou à contact@profood.sn")}.</p>
                    </div>
        }
    ];
    return (
        <FAQModel
            widgetTitle={t("FAQ")}
            pageTitle={`${t("Compte")} & ${t("Connexion")}`}
            questionsAnswers={questionsAnswers}
        />
    );
};

export default AccountAndLogin;
