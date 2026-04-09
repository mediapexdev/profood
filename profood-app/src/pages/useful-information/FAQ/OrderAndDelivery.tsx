import React from "react";

import { useTranslation } from "react-i18next";

import FAQModel from "./Model";
import { QuestionAnswer } from "./types";

import './OrderAndDelivery.css';

/**
 * 
 * @returns 
 */
const OrderAndDelivery: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const questionsAnswers: QuestionAnswer[] = [
        {
            question: `${t('Quelles zones votre service de livraison dessert-il')} ?`,
            answer: <div>
                        <p>{t("Nous proposons actuellement des services de livraison sur tout Dakar et certaines zones spécifiques (Mbour et environs)")}.</p>
                        <p>{t("Veuillez consulter notre site web ou contacter notre service client pour vérifier si nous assurons la livraison à votre emplacement (+221 77 856 89 89)")}.</p>
                    </div>
        },
        {
            question: `${t("Puis-je modifier ma commande une fois passée ou même l'annuler")} ?`,
            answer: <div>
                        <p>{t("Non, vous ne pouvez pas modifier votre commande")}.</p>
                        <p>{t("Nous vous recommandons de vérifier attentivement votre commande avant de la passer")}.</p>
                        <p>{t("Oui, vous pouvez annuler la commande avant que le statut de la commande ne passe à En cours de traitement")}.</p>
                    </div>
        },
        {
            question: `${t("Dans combien de temps puis-je espérer recevoir ma commande")} ?`,
            answer: <div>
                        <p>{t("Nous nous efforçons de fournir un service de livraison rapide")}.</p>
                        <p>{t("Les délais de livraison peuvent varier en fonction de votre emplacement et du volume de commandes que nous recevons")}.</p>
                        <p>{t("Généralement, les commandes sont livrées le jour même ou sous 48 heures")}.</p>
                    </div>
        },
        {
            question: `${t('Quels sont vos frais de livraison')} ?`,
            answer: <div>
                        <p>{t("La livraison est gratuite dans toute la région de Dakar")}.</p>
                        <p>{t("Pour les zones spécifiques, les frais de livraison peuvent varier en fonction de votre emplacement et du montant total de la commande")}.</p>
                        <p>{t("Les frais de livraison seront clairement affichés avant de finaliser la commande")}.</p>
                    </div>
        },
        {
            question: `${t("Que se passe-t'il si je ne suis pas disponible pour recevoir ma commande lors de la livraison")} ?`,
            answer: <div>
                        <p>{t("Si vous n'êtes pas disponible pour recevoir votre commande lors de la livraison, veuillez contacter notre service client dès que possible pour convenir d'un autre horaire de livraison")}.</p>
                        <p>{t("Il est essentiel de nous prévenir à l'avance afin d'éviter tout désagrément")}.</p>
                    </div>
        },
        {
            question: `${t('Que dois-je faire si je reçois une commande endommagée ou incorrecte')} ?`,
            answer: <div>
                        <p>{t("Nous prenons grand soin d'emballer et de livrer votre commande correctement")}.</p>
                        <p>{t("Cependant, si vous recevez une commande endommagée ou incorrecte, veuillez contacter immédiatement notre service client")}.</p>
                        <p>{t("Nous examinerons le problème et ferons tout notre possible pour le résoudre à votre satisfaction")}.</p>
                    </div>
        },
        {
            question: `${t("Que dois-je faire si j'ai des besoins alimentaires particuliers ou des allergies")} ?`,
            answer: <div>
                        <p>{t("Si vous avez des besois alimentaires particuliers ou des allergies, veuillez nous en informer en contactant notre service client avant de passer votre commande")}.</p>
                        <p>{t("Nous ferons de notre mieux pour répondre à vos besoins ou vous proposer des alternatives adaptées")}.</p>
                    </div>
        },
        {
            question: `${t('Comment la viande est-elle conditionnée pour la livraison')} ?`,
            answer: <div>
                        <p>{t("Nous prenons grand soin à ce que votre viande arrive fraîche et bien conservée")}.</p>
                        <p>{t("Notre emballage comprend des boîtes isothermes et de la glace pour maintenir la température appropriée pendant le transport")}.</p>
                        <p>{t("Tous les emballages sont conçus pour conserver votre viande dans des conditions optimales jusqu'à ce qu'elle arrive à votre porte")}.</p>
                    </div>
        },
        {
            question: `${t('Proposez-vous des réductions ou des promotions')} ?`,
            answer: <div>
                        <p>{t("Oui, nous offrons occasionnellement des réductions et des promotions à nos précieux clients")}.</p>
                        {/* <p>{t("Assurez-vous de vous inscrire à notre newsletter ou de nous suivre sur les réseaux sociaux pour rester informé(e) des dernières offres et des offres exclusives")}.</p> */}
                    </div>
        },
        {
            question: `${t("Je n'ai pas reçu ma commande")}. ${t("Qui dois-je contacter")} ?`,
            answer: <div>
                        <p>{t("Consultez l'onglet “Commandes” pour connaître l'état de votre commande")}.</p>
                        <p>{t("Si vous n'avez toujours pas reçu votre commande et pour toute autre question, veuillez contacter notre service client au +221 77 856 89 89 ou à contact@profood.sn")}.</p>
                    </div>
        },
        {
            question: `${t("Puis-je passer une commande au nom de quelqu'un")} ?`,
            answer: <div>
                        <p>{t("Oui, c'est possible")}.</p>
                        <p>{t("Au moment de passer la commande, indiquer l'adresse de livraison de la personne concernée")}.</p>
                    </div>
        },
        {
            question: `${t('Je veux voir toutes mes commandes précédentes')}. ${t('Comment faire')} ?`,
            answer: <div>
                        <p>{t("Connectez-vous à votre compte et sélectionnez l'onglet “Commandes” pour voir la liste de toutes les commandes passées")}.</p>
                    </div>
        },
        {
            question: `${t('Où puis-je suivre ma commande')} ?`,
            answer: <div>
                <p>{t("Sélectionnez l'onglet “Commandes”, vous pourrez voir le statut de la commande concernée en fonction de son numéro")}.</p>
                <p>{t("Nous informons toujours l'utilisateur par email en cas de changement de statut")}.</p>
            </div>
        }
    ];
    return (
        <FAQModel
            widgetTitle={t("FAQ")}
            pageTitle={`${t("Commande")} & ${t("Livraison")}`}
            questionsAnswers={questionsAnswers}
        />
    );
};

export default OrderAndDelivery;
