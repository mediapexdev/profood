# Profood — privacy policy template

Both the App Store and the Play Store require a publicly accessible
privacy policy URL. The text below mirrors what the apps actually
collect (matches `PrivacyInfo.xcprivacy`). Adapt to your legal
context (RGPD France/UE n'applique pas directement, mais la **Loi
n° 2008-12 du 25 janvier 2008** sur la protection des données
personnelles au Sénégal s'applique).

**To deploy:** host this at a URL like
`https://www.profood-app.com/politique-confidentialite` and list the
URL on both store consoles.

---

# Politique de confidentialité — Profood

**Dernière mise à jour : [DATE]**

Profood (« nous », « notre ») exploite l'application mobile **Profood**
(client) et l'application **Profood Livreur** (livreurs). La présente
politique décrit les données collectées et leur usage.

## 1. Données collectées

### Application client (Profood)
- **Nom et prénom** — pour identifier la commande.
- **Numéro de téléphone** — pour la confirmation par SMS et la prise
  de contact par le livreur.
- **Adresse e-mail (facultatif)** — pour l'envoi des reçus.
- **Adresse de livraison** — quartier / commune choisis dans
  l'application.
- **Position GPS précise (facultatif)** — capturée au moment de la
  commande pour permettre au livreur de retrouver l'emplacement exact.
  L'autorisation est demandée à chaque commande ; refuser ne bloque pas
  la commande.

### Application livreur (Profood Livreur)
- **Nom, prénom, e-mail, téléphone** — fournis par le gestionnaire à la
  création du compte.
- **Position GPS** — collectée toutes les 20 secondes uniquement
  pendant qu'au moins une livraison est en cours. Permet au
  gestionnaire de visualiser la tournée en temps réel et de calculer
  les statistiques quotidiennes (distance parcourue, temps moyen de
  livraison).

## 2. Données NON collectées

- Aucun tracking publicitaire.
- Aucun partage de données avec des annonceurs tiers.
- Aucune information bancaire stockée dans l'application — le paiement
  est délégué à PayTech (mobile money sénégalais).

## 3. Stockage et transmission

Les données sont stockées sur les serveurs Profood (hébergement
Heroku) et transitent via HTTPS. Les coordonnées GPS sont conservées
pour les besoins opérationnels et statistiques.

## 4. Conservation

- Données de compte : conservées tant que le compte existe.
- Données de commande : conservées 5 ans pour des raisons comptables.
- Positions GPS des livreurs : conservées 90 jours puis purgées.

## 5. Droits

Conformément à la **Loi n° 2008-12 du 25 janvier 2008** sur la
protection des données à caractère personnel au Sénégal, vous pouvez
demander l'accès, la rectification ou la suppression de vos données en
écrivant à **[ADRESSE EMAIL]**.

## 6. Tiers

- **Firebase Authentication** (Google) — gestion des comptes
  utilisateurs.
- **PayTech** — traitement des paiements mobile money.
- **Postmark** — envoi des e-mails transactionnels.
- **Twilio** — envoi des SMS de vérification.

Chaque tiers applique sa propre politique de confidentialité.

## 7. Mineurs

Profood n'est pas destinée aux mineurs de moins de 13 ans. Aucune
donnée n'est sciemment collectée auprès d'eux.

## 8. Modifications

Cette politique peut évoluer. La date en haut de page reflète la
dernière mise à jour ; les utilisateurs sont avisés des changements
majeurs par notification in-app.

## 9. Contact

Pour toute question : **[ADRESSE EMAIL]**
Profood, **[ADRESSE POSTALE]**, Dakar, Sénégal.
