import React from "react";

import { IonText } from "@ionic/react";

import { useTranslation } from "react-i18next";

import Layout from "./layout/Layout";

/**
 * 
 * @returns 
 */
const TermsAndConditionsPage: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    return (
        <Layout
            contentClassName='terms-and-condition-content'
            widgetTitle={t("Conditions d'utilisation")}
        >
            <IonText>
                <div className="py-4">
                    <p className="fw-semibold text-uppercase">{t("Veuillez lire attentivement ces conditions d'utilisation")}.</p>
                    <p className="fw-semibold text-uppercase">{t("En utilisant cette application ou en commandant des produits à partir de l'application, vous acceptez d'être lié par tous les termes et conditions de cet accord")}.</p>
                    <p className="fw-semibold">{t("PROFOOD est l'unique propriétaire de la marque PROFOOD")}.</p>
                    <br />
                    <p>{t("Les présentes conditions d'utilisation régissent votre utilisation de l'application PROFOOD, l'offre de produits PROFOOD à l'achat sur l'application ou votre achat de produits disponibles sur l'application")}.</p>
                    <p>{t("Ces conditions d'utilisation incluent et intègrent par cette référence les politiques et directives référencées ci-dessous")}.</p>
                    <p>{t("PROFOOD se réserve le droit de modifier ou de réviser ces termes et conditions d'utilisation à tout moment en publiant tout changement ou révision sur l'application")}.</p>
                    <p>{t("Les conditions d'utilisation modifiées ou révisées entreront en vigueur immédiatement après leur publication sur l'application")}.</p>
                    <p>{t("Votre utilisation de l'application après la publication de ces modifications ou révisions constituera votre acceptation de ces modifications ou révisions")}.</p>
                    <p>{t("PROFOOD vous encourage à consulter les présentes conditions d'utilisation chaque fois que vous utilisez l'application pour vous assurer que vous comprenez les termes et conditions régissant l'utilisation de l'application")}.</p>
                    <p>{t("Ces conditions d'utilisation ne modifient en aucune façon les termes ou conditions de toute autre condition d'utilisation écrite que vous pourriez avoir avec PROFOOD pour d'autres produits ou services")}.</p>
                    <p>{t("Si vous n'acceptez pas ces conditions d'utilisation (y compris les politiques ou directives référencées), veuillez immédiatement mettre fin à votre utilisation de l'application")}.</p>
                    {/* <p>{t("Si vous souhaitez imprimer cet accord, veuillez cliquer sur le bouton d'impression de la barre d'outils de votre navigateur")}.</p> */}
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{`${t('Produits')} & ${t("conditions d'offre")}`}</h4>
                    </div>
                    <p>{t("PROFOOD propose à la vente divers types de viandes et produits halieutiques")}.</p>
                    <p>{t("En passant une commande de produits via cette application, vous acceptez ces conditions d'utilisation")}.</p>
                    <p>{t("PROFOOD propose des produits frais à la découpe et qui sont disponibles dans la limite des stocks")}.</p>
                    <p>{t("Ces produits à la découpe sont conditionnés sous vide pour se conserver plus longtemps et préserver leurs saveurs")}.</p>
                    {/* <p>{t("Les informations relatives aux stocks disponibles et au conditionnement sont fournies aux clients au moment de leurs commandes")}.</p> */}
                    <p>{t("Ces informations peuvent être modifiées à tout moment sans préavis")}.</p>
                    {/* <p>{t("En cas de rupture de stock, PROFOOD informera au plus rapidement son client et proposera soit le remboursement de la transaction au prorata du produit indisponible, soit un produit de substitution")}.</p> */}
                    <br />
                    <p>{t("Les prix proposés sur le site PROFOOD sont toutes taxes comprises")}.</p>
                    {/* <p>{t("Ces prix sont annoncés à la pièce (viande découpée et emballée sous vide)")}.</p> */}
                    <p>{t("PROFOOD se réserve le droit de modifier les prix proposés pour ses articles à tout moment et sans préavis")}.</p>
                    {/* <p>{t("Les prix de livraison sont calculés séparément en fonction de la destination, du poids du colis et du type de livraison sélectionné par le client")}.</p> */}
                    <br />
                    {/* <p>{t("En raison de la qualité intrinsèque des produits offerts « à la découpe », le poids des produits livrés par PROFOOD peut varier de +/- 5% par rapport au poids indiqué sur le descriptif du produit")}.</p> */}
                    {/* <p>{t("Si le poids du produit à la découpe est supérieur ou inférieure de 5% au poids indiqué dans le descriptif, l'excédent ou l'insuffisance de poids ne donnera lieu à aucune augmentation ou diminution proportionnelle du prix")}.</p> */}
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Droits de propriété')}</h4>
                    </div>
                    <p>{t("PROFOOD détient les droits de propriété et les secrets commerciaux sur les produits")}.</p>
                    <p>{t("Vous ne pouvez pas copier, reproduire, revendre ou redistribuer toute offre faite par PROFOOD")}.</p>
                    <p>{t("PROFOOD détient également les droits sur toutes les marques, présentations commerciales et mises en page spécifiques de cette application, y compris les appels à l'action, le placement de texte, les images et autres informations")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Livraison')}</h4>
                    </div>
                    <p>{t("En acceptant la livraison, l'acheteur reconnaît que les marchandises achetées disposent des informations requises par les lois et réglementations en vigueur au Sénégal au moment de ladite livraison")}.</p>
                    <p><span className="fw-semibold">{t("Conditions de livraison")}:</span> {t("passez votre commande, payez en ligne ou à la livraison, recevez votre commande directement chez vous ou récupérez-la au comptoir Profood")}.</p>
                    <p>{t("Notre équipe prépare votre commande dans nos locaux où toutes les normes d'hygiène obligatoires sont appliquées")}.</p>
                    {/* <p>{t("Vous pouvez passer commande en ligne à tout moment, les livraisons s'effectuent avec un délai minimum de 48h dans tout le Sénégal")}.</p> */}
                    {/* <p><span className="text-danger">{t("Tarif livraison")}:</span> ({t("Box (inclus dans le coût")}).</p> */}
                    {/* <p><span className="text-danger">{t("Tarif Livraison au détail")}:</span> {t("GRATUITE pour toute commande supérieure à 100 000 F CFA")}.</p> */}
                    <p><span className="fw-semibold">{t("Conditions de conservation")}:</span> {t("tous nos produits sont frais, nous vous conseillons de les conserver au congélateur si vous ne les consommez pas après réception de votre commande")}.</p>
                    {/* <p>{t("Le client est responsable du choix de la date de transport proposée de manière expresse au moment de la conclusion de la transaction")}.</p> */}
                    {/* <p>{t("Le client communiquera à PROFOOD un numéro de téléphone mobile qui sera indiqué sur le colis")}.</p> */}
                    <p>{t("Il appartient au client de communiquer au moment de la commande un lieu de livraison parfaitement identifiable, sans équivoque et accessible")}.</p>
                    <p>{t("Il appartient au client de vérifier sa livraison dès réception en présence du livreur")}.</p>
                    <p>{t("En aucun cas PROFOOD ne pourra être tenu responsable de l'absence du client au moment de la livraison de son colis")}.</p>
                    {/* <br /> */}
                    {/* <p>{t("En raison de la qualité du produit commercialisé par PROFOOD, en cas d'annulation d'une commande par le client au plus tard trois jours ouvrables avant la livraison sollicitée par le client, l'intégralité de la commande restera due")}.</p> */}
                    {/* <p>{t("PROFOOD est tributaire des prestations de son transporteur et ne peut être tenue pour responsable d'une faute dans la réalisation du service de transport de son sous-traitant")}.</p> */}
                </div>
            </IonText>
            {/* <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Sollicitation de la clientèle')}</h4>
                    </div>
                    <p>{t("À moins que vous n'avisiez nos représentants commerciaux de PROFOOD, pendant qu'ils vous appellent, de votre désir de vous désinscrire des autres communications et sollicitations directes de l'entreprise, vous acceptez de continuer à recevoir d'autres courriels et sollicitations d'appels PROFOOD et ses équipes d'appel internes ou tierces désignées")}.</p>
                    <p>{t("Vous pouvez utiliser le lien de désinscription figurant dans toute sollicitation par e-mail que vous pourriez recevoir")}.</p>
                    <br />
                    <p>{t("Vous pouvez également choisir de vous désinscrire en envoyant votre adresse e-mail à: contact@profood.sn")}.</p>
                    <p>{t("Vous pouvez envoyer une demande de suppression écrite à LOT 44, Route des Mamelles, Dakar - Sénégal")}.</p>
                </div>
            </IonText> */}
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t("Contenu de l'application, propriété intellectuelle, liens vers des tiers")}</h4>
                    </div>
                    <p>{t("PROFOOD veille à la qualité des contenus, photos et illustrations présentés sur l'application")}.</p>
                    <p>{t("Toutefois, les photos et illustrations ont valeur d'exemple et PROFOOD ne pourra être tenu responsable de ces visuels, par comparaison aux produits livrés")}.</p>
                    {/* <p>{t("De même PROFOOD ne pourra être tenue pour responsable en cas de d'erreur, d'imprécisions ou d'omissions concernant l'offre de produits commercialisés sur ce site")}.</p> */}
                    <p>{t("L'utilisation non autorisée du contenu peut violer les lois sur les droits d'auteur, les marques déposées et/ou d'autres lois")}.</p>
                    <p>{t("Vous reconnaissez que votre utilisation du contenu de l'application est à des fins personnelles et non commerciales")}.</p>
                </div>
            </IonText>
            {/* <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Publication')}</h4>
                    </div>
                    <p>{t("En publiant, stockant ou transmettant tout contenu sur le site web, vous accordez par la présente à PROFOOD une licence perpétuelle dans le monde entier, non exclusif, libre de droits, cessible, droit et licence d'utilisation, de copie, d'affichage, d'exécution, de création d'œuvres dérivées, de distribution, de distribution, de transmission et d'attribution de ce contenu sous quelque forme que ce soit, dans tous les médias connus ou ci-après créés, partout dans le monde")}.</p>
                </div>
            </IonText> */}
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Inscription')} - {t('Connexion')}</h4>
                    </div>
                    <p>{t("En nous fournissant votre numéro de téléphone et votre adresse email, vous nous autorisez à vous contacter par téléphone/SMS/Whatsapp/e-mail")}.</p>
                    {/* <p>{t("Afin de vous désinscrire de nos mises à jour Whatsapp, veuillez envoyer un e-mail à notre équipe de service client")}.</p> */}
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Réclamation')}</h4>
                    </div>
                    <p>{t("Toute réclamation doit être formulée par email dans les deux jours suivant la livraison")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Limitation de responsabilité')}</h4>
                    </div>
                    <p>{t("PROFOOD ne sera pas responsable de tout dommage direct, indirect, accidentel, spécial ou consécutif en relation avec ces conditions d'utilisation ou les produits de quelque manière que ce soit, y compris les responsabilités découlant de")}:</p>
                    <p>{'1)'} {t("L'utilisation ou l'incapacité d'utiliser le contenu ou les produits de l'application")}.</p>
                    <p>{'2)'} {t("Le coût d'acquisition de produits ou de contenus de substitution")}.</p>
                    <p>{'3)'} {t("Tout produit acheté ou obtenu ou transaction effectuée via l'application")}.</p>
                    <p>{'4)'} {t("Toute perte de profits que vous allèguez")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Exclusion de garanties')}</h4>
                    </div>
                    {/* <p>{t("Votre utilisation de ce site web et/ou des produits est à vos propres risques")}.</p> */}
                    <p>{t("Les produits sont proposés « tels quels » et « sous réserve de disponibilité »")}.</p>
                    <p>{t("PROFOOD décline expressément toute garantie de quelque nature que ce soit, explicite ou implicite, y compris, mais sans s'y limiter, les garanties implicites de qualité marchande, d'adéquation à un usage particulier et de non-contrefaçon en ce qui concerne les produits ou le contenu de l'application, ou tout autre la dépendance ou l'utilisation du contenu ou des produits de l'application")}.</p>
                    <p>{t("Sans limiter la généralité de ce qui précède, PROFOOD n'accorde aucune garantie")}.</p>
                    <p>{t("Aucun conseil ou information, qu'il soit oral ou écrit, obtenu par vous à partir de l'application ne créera une garantie non expressément mentionnée dans les présentes")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Modifications des services et des prix')}</h4>
                    </div>
                    <p>{t("Les prix de nos produits sont sujets à changement sans préavis")}.</p>
                    <p>{t("Nous nous réservons le droit à tout moment de modifier ou d'interrompre le service (ou toute partie ou contenu de celui-ci) sans préavis et à tout moment)")}.</p>
                    <p>{t("Nous ne serons pas responsables envers vous ou envers tout tiers pour toute modification, changement de prix, suspension ou interruption du service")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t("Accord d'être lié")}</h4>
                    </div>
                    <p>{t("En utilisant l'application ou en commandant des produits, vous reconnaissez que vous avez lu et acceptez d'être lié par tous les termes et conditions d'utilisation")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Force majeure générale')}</h4>
                    </div>
                    <p>{t("En cas de force majeure, Profood ne sera pas tenu de procéder à la livraison de ses produits")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t("Cessation d'activité")}</h4>
                    </div>
                    <p>{t("PROFOOD peut à tout moment, à sa seule discrétion et sans préavis, cesser l'exploitation de l'application et de la distribution des produits")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t("Intégrité de l'accord")}</h4>
                    </div>
                    <p>{t("Cet accord comprend l'intégralité de l'accord entre vous et PROFOOD et remplace tout accord antérieur relatif à l'objet contenu dans le présent document")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Rétractation')}</h4>
                    </div>
                    <p>{t("Le client ne pourra user d'aucun droit de rétractation en raison du caractère périssable des produits vendus sur l'application")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Loi applicable')}</h4>
                    </div>
                    <p>{t("La juridiction sénégalaise est seule compétente pour résoudre tout litige relatif aux relations contractuelles couvertes par les présentes conditions d'utilisation")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Résiliation')}</h4>
                    </div>
                    <p>{t("PROFOOD se réserve le droit de mettre fin à l'accès à votre compte utilisateur si elle estime raisonnablement, à sa seule discrétion, que vous avez violé l'un des termes et conditions d'utilisation")}.</p>
                    <p>{t("Après la résiliation, vous ne serez plus autorisé à accéder à votre compte utilisateur et PROFOOD pourra, à sa seule discrétion et sans préavis, annuler toute commande de produits en cours")}.</p>
                    <p>{t("En cas de résiliation de l'accès à votre compte utilisateur, PROFOOD se réserve le droit d'exercer tous les moyens qu'elle jugera nécessaires pour empêcher tout accès non autorisé à votre compte utilisateur")}.</p>
                    <p>{t("Ces conditions d'utilisation survivront indéfiniment à moins et jusqu'à ce que PROFOOD choisisse, à sa seule discrétion et sans préavis, d'y mettre fin")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Utilisation hors du Sénégal')}</h4>
                    </div>
                    <p>{t("Les utilisateurs qui accèdent à l'application depuis l'extérieur du Sénégal le font à leurs propres risques et doivent assumer l'entière responsabilité du respect des lois locales applicables")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Cession')}</h4>
                    </div>
                    <p>{t("Vous ne pouvez pas céder vos droits et obligations en vertu du présent accord")}.</p>
                    <p>{t("PROFOOD peut céder ses droits et obligations en vertu du présent accord à sa seule discrétion et sans préavis")}.</p>
                </div>
            </IonText>
            <IonText>
                <div className="py-4">
                    <div className="title-wrapper">
                        <h4>{t('Divisibilité')}</h4>
                    </div>
                    <p>{t("Dans le cas où une disposition des présentes Conditions d'utilisation est jugée illégale, nulle ou inapplicable, cette disposition sera néanmoins exécutoire dans toute la mesure permise par la loi applicable, et la partie inapplicable sera réputée être séparée des présentes conditions d'utilisation")}.</p>
                    <p>{t("Une telle détermination n'affectera pas la validité et le caractère exécutoire des autres dispositions restantes")}.</p>
                </div>
            </IonText>
        </Layout>
    );
};

export default TermsAndConditionsPage;
