# Kit de publication Profood Livreur 1.0.0

Application réservée aux livreurs partenaires (comptes créés par le gestionnaire). Diffusion publique sur l'App Store et Google Play, avec un compte livreur de démonstration fourni aux examinateurs.

```
store/
├── ios/
│   ├── fiche-app-store.md        # textes App Store Connect, notes review, questionnaire confidentialité
│   ├── app-icon-1024.png
│   └── screenshots/              # iphone-01..05 (1290×2796) — générés depuis le dev server avec les données de démo
├── android/
│   ├── fiche-play-store.md
│   ├── icon-512.png
│   ├── feature-graphic-1024x500.png
│   └── screenshots/              # android-01..05 (1080×2160)
└── README.md
```

Identifiants : bundle/package `sn.profood.livreur` (iOS et Android), version 1.0.0, build 1 / versionCode 1.
Politique de confidentialité : https://profood-app.com/confidentialite-livreur (page du site v2, à déployer avant soumission).
Signature Android : `~/Keys/profood/livreur/profood-livreur-upload.jks` (alias `profood-livreur`), mots de passe dans `~/Keys/profood/livreur/keystore.properties`, copié en `android/keystore.properties` (ignoré par git).
Signature iOS : certificat Apple Distribution « Profood » (`~/Keys/profood/ios/`) + profil App Store à créer pour `sn.profood.livreur`.
Clé d'app : `VITE_PROFOOD_APP_LIVREUR_KEY` dans `.env.local` (valeur = `PROFOOD_APP_LIVREUR_KEY` du `.env` serveur), obligatoire avant tout build de production.
