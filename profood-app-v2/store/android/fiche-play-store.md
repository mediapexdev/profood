# Fiche Google Play — PROFOOD 2.0.0

Préparée en même temps que la fiche App Store. ⚠️ Le projet Android (`android/`) n'est pas encore généré : faire `npx cap add android` puis `npm run build:mobile` avant de pouvoir produire un AAB signé. Les visuels et textes ci-dessous sont prêts.

## Fiche principale

| Champ | Valeur |
|---|---|
| Nom de l'app (30 max) | `PROFOOD – Boucherie halal` |
| Description courte (80 max) | `Viande halal fraîche, préparée par nos bouchers et livrée chez vous à Dakar.` (77) |
| Catégorie | Gastronomie et boissons |
| Adresse e-mail de contact | à renseigner (obligatoire sur Play) |
| Site web | `https://profood-app.com` |
| Politique de confidentialité | `https://profood-app.com/confidentialite` |
| Application ID | `com.profoodapp.app` |

## Description complète (4000 max)

Reprendre mot pour mot la « Description » de `../ios/fiche-app-store.md` : Play accepte le même texte (pas de HTML nécessaire).

## Visuels (dans `store/android/`)

| Élément | Fichier | Contrainte Play |
|---|---|---|
| Icône | `icon-512.png` | 512 × 512, PNG 32 bits |
| Image de présentation (feature graphic) | `feature-graphic-1024x500.png` | 1024 × 500, obligatoire |
| Captures téléphone | `screenshots/android-01-accueil.png` … `android-06-checkout.png` | 1080 × 2160 (ratio 2:1 max respecté), 2 minimum, 8 maximum |
| Captures tablette | reprendre `../ios/screenshots/ipad-*.png` (2048 × 2732) | acceptées telles quelles |

## Questionnaires Play Console

- **Sécurité des données** : mêmes réponses que le tableau « Confidentialité de l'app » de la fiche App Store (nom, téléphone, e-mail facultatif, adresse, historique d'achats ; collectées, chiffrées en transit, suppression sur demande ; aucun partage publicitaire).
- **Classification du contenu** : questionnaire IARC, aucune réponse positive → Tous publics / PEGI 3.
- **Public cible** : 18 ans et plus.
- **Application de commerce** : oui, vente de biens physiques (viande) ; paiement hors Google Play Billing autorisé pour les biens physiques.
- **Autorisations** : aucune permission dangereuse (pas de localisation, pas de caméra).

## Nouveautés (500 max)

```
Nouvelle interface, commande sans compte, box toutes prêtes, recherche et favoris, frais de livraison par zone (gratuit dès 25 000 FCFA), paiement à la livraison ou en ligne, suivi de commande et assistance WhatsApp.
```
