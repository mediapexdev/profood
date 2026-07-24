# Notes de déploiement — profood-app-v2

App cliente v2 (Vite + React 19 + Tailwind 4 + Capacitor 7). Remplace à terme `profood-app` (Ionic/CRA). Backend commun : `https://api.profood-app.com/api/` (LWS, MySQL).

## 1. Build web

```bash
cd profood-app-v2
npm install
npm run build        # tsc -b && vite build → dist/
```

- La base URL de l'API est détectée automatiquement (`src/api/client.ts`) :
  build → `https://api.profood-app.com/api/`, dev → `http://localhost:8000/api/`. Aucun réglage à faire.
- **Les variables `VITE_*` sont figées AU BUILD** (inlinées par Vite). Changer le `.env` après coup ne sert à rien : il faut rebuilder.

## 2. Variables d'environnement (au moment du build)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `VITE_APP_KEY` | **OUI en prod** | Clé applicative envoyée comme `app_key` sur `/signin`, `/signup`, `/password-reset`… Doit être **identique** au `PROFOOD_APP_KEY` du `.env` serveur (api-profood, prod LWS). Équivalent du `REACT_APP_KEY` de l'app Ionic. |
| `VITE_USE_API_CATALOG` | Recommandé en prod (`true`) | Bascule le catalogue (box, catégories, découpes) sur l'API Laravel. Sans elle, catalogue local embarqué (Phase 0 — IDs alignés sur l'API, images servies en local dans les deux cas). |
| `VITE_USE_API_ORDERS` | **OUI en prod (`true`)** | Commandes **réelles** : localités API + frais serveur (`quote-delivery-fee`), checkout invité → `POST /guest-order(-with-payment)`, connecté → panier serveur + `add-order-*`, **PayTech** (redirection vers `redirect_url`), statut réel dans historique/suivi. Sans elle : commandes localStorage de démo. |

⚠️ **Piège auth double mode** : sans `VITE_APP_KEY` au build, l'app bascule silencieusement en **mode local** (comptes en localStorage, aucune vraie session API). C'est voulu pour la démo/dev, mais en prod ça donnerait une app qui « marche » sans jamais toucher le serveur. Vérifier après build que la connexion crée bien une session API (requête `/signin` visible dans le réseau).

La valeur de la clé n'existe **pas en local** : elle vit uniquement dans le `.env` du serveur prod LWS (`PROFOOD_APP_KEY`).

## 3. Hébergement web (PWA)

- Contenu à publier : le dossier `dist/` tel quel.
- **SPA rewrite obligatoire** : l'app utilise `BrowserRouter` — toute URL profonde (`/commandes`, `/suivi/...`) doit être réécrite vers `index.html` (`.htaccess` sur LWS, comme pour l'app manager), sinon 404 au refresh/lien direct.
- ⚠️ **`base: './'` + routes profondes** : `vite.config.ts` construit avec des chemins relatifs (requis pour Capacitor). Servi en web avec rewrite SPA, une URL profonde résout `./assets/...` relativement au chemin courant → assets 404. **À vérifier sur l'hébergement réel** ; si ça casse, builder le web avec `base: '/'` (et garder `'./'` uniquement pour le build Capacitor, ex. via un mode Vite dédié).
- PWA : `vite-plugin-pwa` en `autoUpdate` — le service worker se met à jour seul à chaque déploiement (pas de purge manuelle). Précache JS/CSS/HTML/woff2 ; photos produits (~9 Mo) en cache runtime stale-while-revalidate ; Google Fonts en cache-first 1 an.
- Servir en **HTTPS** (requis pour service worker + installation PWA).

## 4. Mobile natif (Capacitor)

```bash
npm run build:mobile   # build web + npx cap sync
npm run open:android   # Android Studio
npm run open:ios       # Xcode
```

- Les dossiers `ios/` et `android/` **n'existent pas encore** : faire `npx cap add ios` / `npx cap add android` la première fois.
- `appId` = `com.profoodapp.app` — **le même que l'app Ionic v1**. Sur les stores, la v2 sera donc une mise à jour de la v1 (même fiche). C'est cohérent avec un remplacement, mais interdit de publier v1 et v2 côte à côte.
- Rendu mobile **non vérifié visuellement** à ce jour (seulement en émulation navigateur 390 px).

## 5. Côté serveur (rappels)

- `PROFOOD_APP_KEY` non vide dans le `.env` prod → l'API **rejette** signin/signup CUSTOMER sans `app_key` correspondant. ⚠️ Une ligne `PROFOOD_APP_KEY=` avec **chaîne vide** compte déjà comme « posée » (l'auth se met à exiger l'app_key) : soit une vraie valeur, soit pas de ligne du tout.
- SMS : la vérification par code (inscription, reset) consomme du **Twilio réel** en prod ; en local un OTP fixe est utilisé. Chaque commande (invité) envoie aussi un SMS Twilio + e-mails Postmark.
- **PayTech** (`.env` serveur) : `PAY_TECH_API_KEY` / `PAY_TECH_API_SECRET` posés, et `PAYTECH_TEST_MODE=false` pour encaisser réellement (fail-safe : toute autre valeur = sandbox). L'IPN est en dur sur `https://api.profood-app.com/api/redirect-payment`.
- ⚠️ **`services.paytech.client_app_url` doit pointer sur le domaine où la v2 est déployée** : le serveur construit les URLs de retour de paiement (`/guest-order-success/{hash}?ref=`, `/orders/successful-order/{hash}`, `/orders/cancelled-order/{hash}`, `/views/cart`) à partir de cette valeur. La v2 route ces quatre chemins ; s'il pointe encore sur l'app v1, le client revient sur la v1 après paiement.
- Frais de livraison : par **commune** (`communes.delivery_fee`) + franco global (`delivery_settings.free_shipping_threshold`), gérés dans l'app manager — la v2 les affiche via `POST /quote-delivery-fee` (public) et le serveur les recalcule à la commande.
- **Migration des images produits** (remplace les base64 legacy par les visuels pro de la v2, IDs alignés) :
  1. En local : `cd api-profood && python3 tools/build-catalog-images-bundle.py` → `catalog-images-bundle.zip` (~4 Mo, 61 découpes + 4 box + 3 catégories + manifest).
  2. Téléverser et dézipper sur le serveur, puis `php artisan catalog-images:import /chemin/catalog-images-bundle --dry-run` (contrôle) puis sans `--dry-run`.
  3. Pré-requis : lien `php artisan storage:link` (la route publique `api/image/{path}` lit `storage/app/public/`). Les PNG gardent leur transparence (aucun réencodage) ; l'ancienne illustration disque est nettoyée, les base64 sont simplement remplacés. Idempotent (re-lançable).
  Bénéfices : `get-slices` sans base64 (payload divisé), mêmes visuels dans v1/manager/livreur que dans la v2.

## 6. Limites connues avant un go-live complet (état 2026-07-23, après ajout PayTech/panier/i18n)

Voir la section « Conformité v1 » ci-dessous pour le détail feature par feature.

- **Suivi invité** : sans compte, le statut reste **simulé par le temps écoulé** (aucun endpoint public de statut côté API). Le statut réel s'affiche pour les clients connectés.
- **Box composée** : envoyée à l'API **décomposée en découpes** (pas de `box_type_id` serveur pour une composition libre) — le total affiché = somme des prix réels, identique au recalcul serveur.
- **Images produits** : servies en local même avec le catalogue API.
- **Commits sur `main` non poussés** vers origin — pousser avant tout déploiement.

## 7. Conformité v1 (profood-app Ionic) — état feature par feature

Audit du 2026-07-23, mis à jour après les deux vagues de la journée (PayTech + panier serveur + i18n, puis promos + annulation + conversion invité + box prédéfinis + édition de profil). Légende : ✅ équivalent · 🟡 présent mais local/partiel · ❌ absent.

En une phrase : **avec les trois drapeaux posés (`VITE_APP_KEY`, `VITE_USE_API_CATALOG`, `VITE_USE_API_ORDERS`), la v2 couvre tout le périmètre transactionnel de la v1** (auth, catalogue, box prédéfinis, commandes invité + connecté, PayTech, promos, frais par zone, statut réel, annulation, conversion invité → compte, profil) **et la dépasse** (favoris, i18n à clés stables, jetons opaques) ; restent locaux : adresses, favoris, suivi invité (simulé) ; restent absents : recherche serveur, vues serveur `/views/*`, FAQ/CGU, Firebase, push.

| Feature v1 | v2 | Détail |
|---|---|---|
| Connexion / inscription 3 étapes OTP / reset OTP / signout | ✅ | Mêmes endpoints que la v1 (`/signin`, `/check-verification-code`, `/signup`, `/password-reset`) en mode API ; mode local sans OTP si pas de `VITE_APP_KEY`. Purge session sur 401 identique. |
| Catalogue découpes + catégories | 🟡 | API derrière `VITE_USE_API_CATALOG`, sinon JSON local. Images toujours locales. Catégories « mer » retirées (décision verrouillée). |
| **Box prédéfinis** (Noflaye, Woyofal…) | ✅ | Pages `/box` + `/box/:id` (lien nav desktop + bannière boutique) : le modèle fixe prix et capacité, remplissage EXACT à la capacité (règle v1), découpes `available_in_box`. Part à l'API en `{type:'box', box_type_id, slices}` — le serveur facture le prix du modèle. Modèles depuis `get-box-types` (catalogue API) sinon `boxes.json`. |
| Composer un box | 🟡 | Planche anatomique bœuf uniquement, capacité fixe 8 — pas de modèles de box. Prix = **somme des prix réels des découpes** (aligné sur le recalcul serveur ; l'ancien forfait 14 100/découpe est abandonné) ; la box part à l'API décomposée en découpes. |
| Recherche | 🟡 | Client-side dans la boutique (insensible aux accents) ; pas de `/search` API ni page dédiée. |
| Panier serveur connecté (`/add-slices-to-cart`…) | ✅ | Panier local = source de vérité (UX rapide, offline) ; **fusion du panier serveur au login** (`auth:login` → `get-cart`, qté max des deux) et **réalignement serveur au checkout** (`syncServerCart` : purge + ré-ajout) avant `add-order-*` — le serveur commande son propre panier, donc identique au local. |
| Checkout invité (`/guest-order`) | ✅ (drapeau) | Avec `VITE_USE_API_ORDERS=true` : `POST /guest-order` (à la livraison) ou `/guest-order-with-payment` (PayTech). Réf. serveur (`string_id`) affichée ; enregistrement local conservé sous jeton opaque. Sans drapeau : démo locale. |
| Commande connectée (`/add-order-without-payment`) | ✅ (drapeau) | Panier serveur synchronisé puis `add-order-without-payment` / `add-order-with-payment` (session API réelle uniquement — un compte local de démo passe par le flux invité). |
| **Paiement PayTech** | ✅ (drapeau) | Choix « à la livraison / payer en ligne » au checkout. Pas de `paytech.min.js` : l'API renvoie `{token, redirect_url}` → redirection ; brouillon gelé sous le hash `order_id` et finalisé par les routes de retour (`/guest-order-success/:hash?ref=`, `/orders/successful-order/:hash`, `/orders/cancelled-order/:hash`) ; panier conservé jusqu'au succès, annulation = panier intact. |
| Conversion invité → compte (`/convert-guest-order`) | ✅ | Carte « créer un compte » sur la confirmation d'une commande invitée (mode auth API) : mot de passe seul, téléphone repris de la commande, toutes les commandes au même numéro rattachées, connexion immédiate. Nécessite `VITE_APP_KEY` (l'endpoint exige l'app_key). |
| Localités / frais par zone (`/get-localites-with-full-info`, ~2000 localités, frais serveur) | ✅ (drapeau) | Autocomplete sur les localités API (marcheur de pagination, cache session), frais **officiels** via `POST /quote-delivery-fee` (franco inclus) à chaque changement de localité/sous-total. La table statique de 10 communes ne sert plus qu'au mode démo. |
| Codes promo (`/validate-promo-code`) | ✅ (drapeau) | Champ promo au checkout (endpoint public, remise indicative — le serveur re-valide et recalcule à la commande), ligne de réduction dans récap/suivi, `promotion_code` envoyé sur les 4 endpoints de commande. |
| Historique commandes | ✅ (connecté) / 🟡 (invité) | Connecté : `get-customer-orders-by-user` → statut réel reporté sur les commandes locales + affichage des commandes passées depuis un autre appareil. Invité : liste locale. |
| Suivi de commande | ✅ (connecté) / 🟡 (invité) | Le statut serveur (8/16/32/64/80 → 4 étapes + annulée) **prime** sur la simulation ; invité sans compte : simulation temporelle (pas d'endpoint public de statut). |
| Annulation commande (`/cancel-order`) | ✅ | Bouton d'annulation en deux temps sur le suivi — règle v1 : uniquement au stade « reçue », client connecté, commande serveur connue. Le statut serveur rattrape l'affichage même si la requête échoue après coup (ex. SMS). |
| Édition profil / changement mot de passe | ✅ | Page `/profil` (entrée « Modifier mon profil » dans le Compte, connecté) : prénom/nom/e-mail via `update-profile-details` (téléphone = clé d'identité, verrouillé), mot de passe via `change-password` (vérifie l'actuel). Double mode (comptes locaux en démo). |
| Adresses enregistrées | 🟡 | CRUD complet mais localStorage, non lié au compte serveur. |
| **i18n FR/EN** | ✅ | i18n maison typé (`src/i18n/`) à **clés stables** (décision projet — pas de phrases FR comme clés, contrairement à la v1), sélecteur FR/EN dans le Compte, persisté (`localStorage.lang`, même clé que la v1), dates localisées. Hors périmètre : messages d'erreur renvoyés par l'API (en français côté serveur). |
| Dark mode | ✅ | Persisté, suit `prefers-color-scheme`. |
| PWA / service worker | ✅ | Mieux que la v1 (autoUpdate, caches runtime). |
| Capacitor natif | 🟡 | Config + plugins présents, mais `ios/`/`android/` jamais générés. |
| FAQ / CGU / confidentialité, vues serveur `/views/*`, Firebase, rappel de connexion invité | ❌ | Absents ; « Aide & contact » désactivé dans le compte. |

**En plus dans la v2 (absent de la v1)** : favoris (page + cœurs), mode démo hors-ligne complet, planche anatomique interactive, tokens de commande opaques (non devinables, vs référence énumérable v1).

## 8. Checklist de mise en prod

1. [ ] `git push origin main` (commits en attente).
2. [ ] Récupérer `PROFOOD_APP_KEY` depuis le `.env` serveur → `.env` de build : `VITE_APP_KEY=...`.
3. [ ] `.env` de build : `VITE_USE_API_CATALOG=true` **et** `VITE_USE_API_ORDERS=true`.
4. [ ] Serveur : `PAY_TECH_API_KEY`/`SECRET` posés, `PAYTECH_TEST_MODE=false` (sinon sandbox), **`client_app_url` = domaine v2** (retours de paiement).
5. [ ] `npm run build`, vérifier dans le réseau : `/signin` part vers `api.profood-app.com` avec `app_key`, le checkout charge les localités et `quote-delivery-fee`.
6. [ ] Publier `dist/` + règle de réécriture SPA ; tester un lien profond (`/commandes`) en navigation privée — page **et** assets.
7. [ ] Tester l'installation PWA (Android + iOS Safari) et le mode hors-ligne.
8. [ ] Smoke test bout en bout : inscription (SMS réel), connexion, commande invité **à la livraison** (vérifier qu'elle apparaît dans l'app manager), puis **paiement en ligne en sandbox d'abord** (`PAYTECH_TEST_MODE=true`) : redirection PayTech → retour succès → confirmation ; et retour annulation → panier intact.
9. [ ] Basculer `PAYTECH_TEST_MODE=false` seulement après le smoke test sandbox.
