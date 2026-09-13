# Fiche App Store — PROFOOD 2.0.0

À coller tel quel dans App Store Connect (My Apps → PROFOOD → version 2.0.0). Les limites de caractères Apple sont indiquées ; chaque champ a été compté.

## Informations de l'app

| Champ | Valeur |
|---|---|
| Nom (30 max) | `PROFOOD – Boucherie halal` (25) |
| Sous-titre (30 max) | `Viande fraîche livrée à Dakar` (29) |
| Catégorie principale | Alimentation et boissons (Food & Drink) |
| Catégorie secondaire | Shopping |
| Classification | 4+ (aucun contenu sensible) |
| Bundle ID | `sn.profood.app` (`com.profoodapp.app` est réservé par une autre équipe Apple, comme sur Google Play ; App ID enregistré le 2026-09-13) |
| Version | 2.0.0 — build 1 |
| Copyright | © 2026 Profood |
| Langue principale | Français (France) |
| URL d'assistance | `https://profood-app.com` |
| URL marketing | `https://profood-app.com` |
| URL politique de confidentialité | `https://profood-app.com/confidentialite` (page intégrée à l'app v2 ; en ligne après téléversement du `dist/` sur LWS) |
| Contact assistance | WhatsApp +221 78 711 29 29 |

## Texte promotionnel (170 max, modifiable sans nouvelle soumission)

```
Nouvelle version : catalogue plus rapide, box prêtes à composer, commande sans compte, suivi en direct et paiement Orange Money, Wave ou carte.
```

## Description (4000 max)

```
PROFOOD, c'est votre boucherie halal à Dakar, dans votre poche. Choisissez vos découpes de bœuf, de mouton ou de volaille, nous les préparons le jour même et nous vous les livrons chez vous.

COMMANDEZ EN QUELQUES GESTES
Parcourez le catalogue par catégorie, recherchez une découpe précise, ajoutez-la au panier et validez. Vous pouvez commander sans créer de compte : un nom, un numéro de téléphone et une adresse suffisent.

NOS BOX TOUTES PRÊTES
Noflaye, Woyofal, Xéweul, Téranga : quatre formats à prix fixe, de 6 à 12 découpes, dont vous choisissez vous-même le contenu. Idéal pour la semaine, une grillade entre amis ou un événement familial.

LIVRAISON À DAKAR
Livraison dans toute la région de Dakar, chaîne du froid maîtrisée. Les frais dépendent de votre zone et la livraison est offerte à partir de 25 000 FCFA.

PAIEMENT À VOTRE CONVENANCE
Réglez à la livraison, en espèces ou par Wave et Orange Money auprès du livreur, ou payez en ligne par Orange Money, Wave ou carte bancaire via PayTech.

SUIVEZ VOTRE COMMANDE
Chaque commande a une page de suivi : reçue, en préparation, en livraison, livrée. Retrouvez aussi l'historique de vos commandes et vos adresses enregistrées dans votre compte.

VOS DÉCOUPES EXPLIQUÉES
Chaque fiche produit situe le morceau sur l'animal et décrit sa préparation, pour choisir la bonne pièce selon votre recette.

BESOIN D'AIDE ?
Notre équipe répond sur WhatsApp directement depuis l'app.

Viande 100 % halal, sélectionnée et préparée par nos bouchers à Dakar.
```

## Mots-clés (100 max, séparés par des virgules, sans espace après la virgule)

```
boucherie,halal,viande,dakar,senegal,livraison,boeuf,mouton,poulet,tabaski,grillade,wave,orange money
```
(96 caractères)

## Nouveautés de cette version (4000 max)

```
PROFOOD fait peau neuve.

• Nouvelle interface, plus rapide et plus lisible, avec mode sombre.
• Commande sans compte : nom, téléphone, adresse, c'est tout.
• Box toutes prêtes Noflaye, Woyofal, Xéweul et Téranga, contenu au choix.
• Recherche et tri du catalogue, favoris.
• Livraison par zone avec frais calculés avant validation, gratuite dès 25 000 FCFA.
• Paiement à la livraison ou en ligne (Orange Money, Wave, carte).
• Suivi de commande en temps réel et historique.
• Assistance WhatsApp intégrée.
```

## Informations pour l'équipe de review Apple

À mettre dans « Notes » de la section App Review. Pas besoin de compte de démo : tout le parcours est accessible sans connexion.

```
PROFOOD is a halal butcher shop in Dakar, Senegal. The app lets customers order meat cuts for home delivery in the Dakar area only.

No demo account is needed: browsing the catalog, filling the cart and placing an order are all available without signing in (guest checkout). Sign-up requires a Senegalese mobile number because a one-time code is sent by SMS; if you need an authenticated session, please contact us on WhatsApp +221 78 711 29 29 and we will provide a test account.

To review the ordering flow without generating a real delivery, choose "À la livraison" (cash on delivery) as the payment method: no charge is made. Online payment goes through PayTech, a Senegalese payment gateway (Orange Money, Wave, cards), and is only meaningful with a local wallet.

Delivery is limited to Dakar; addresses outside the served zones are rejected at checkout by design.
```

## Confidentialité de l'app (questionnaire « App Privacy »)

Réponses à déclarer. Aucun traceur publicitaire, aucun SDK d'analyse tiers dans la v2.

| Type de donnée | Collectée | Liée à l'identité | Utilisée pour le suivi | Finalité |
|---|---|---|---|---|
| Nom | Oui | Oui | Non | Fonctionnalités de l'app (livraison) |
| Numéro de téléphone | Oui | Oui | Non | Fonctionnalités de l'app, authentification par SMS |
| Adresse e-mail | Oui (facultatif) | Oui | Non | Fonctionnalités de l'app (confirmations) |
| Adresse physique | Oui | Oui | Non | Fonctionnalités de l'app (livraison) |
| Historique d'achats | Oui | Oui | Non | Fonctionnalités de l'app |
| Données de paiement | Non (traitées par PayTech, jamais stockées par l'app) | — | — | — |
| Localisation précise | Non | — | — | — |
| Identifiants publicitaires | Non | — | — | — |

Réponse à « Est-ce que les données sont utilisées pour le suivi ? » : **Non**.

## Conformité export (chiffrement)

L'app n'utilise que HTTPS standard. `ITSAppUsesNonExemptEncryption=false` est déjà posé dans `ios/App/App/Info.plist`, la question n'est donc plus posée à chaque build :

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

## Captures d'écran à téléverser

Fichiers dans `store/ios/screenshots/` (déjà aux dimensions Apple, PNG sans transparence) :

| Emplacement App Store Connect | Fichiers | Taille |
|---|---|---|
| iPhone 6,9" (accepte aussi le 6,7") | `iphone-01-accueil.png` … `iphone-06-checkout.png` | 1290 × 2796 |
| iPad 13" (accepte le 12,9") | `ipad-01-accueil.png` … `ipad-04-panier.png` | 2048 × 2732 |

Ordre conseillé : accueil, boutique, box, fiche produit, panier, paiement. Les trois premières apparaissent sur la fiche avant défilement, ce sont les plus importantes.

## Checklist avant « Envoyer pour review »

- [ ] Page `/confidentialite` en ligne : elle est intégrée à l'app v2 (route `/confidentialite`, lien dans Compte) ; il reste à téléverser le nouveau `dist/` sur LWS pour qu'elle réponde sur profood-app.com (Apple vérifie l'URL).
- [ ] Certificat de distribution + profil de provisioning créés (Xcode le fait automatiquement si « Automatically manage signing » est coché avec le compte Apple Developer).
- [ ] Archive téléversée depuis Xcode (Product → Archive → Distribute App → App Store Connect).
- [ ] Build sélectionné dans la version 2.0.0.
- [ ] Captures iPhone + iPad téléversées.
- [ ] Questionnaire confidentialité rempli (tableau ci-dessus).
- [ ] `PAYTECH_TEST_MODE=false` côté serveur si le paiement en ligne doit encaisser réellement.
