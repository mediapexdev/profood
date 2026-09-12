# Kit de publication PROFOOD 2.0.0

Tout ce qu'il faut pour la fiche App Store et, le jour venu, la fiche Google Play. Généré le 12 septembre 2026 depuis le build v2 (catalogue et prix réels de l'API prod, mode sombre).

```
store/
├── ios/
│   ├── fiche-app-store.md        # textes à coller dans App Store Connect + notes review + questionnaire confidentialité + checklist
│   ├── app-icon-1024.png         # icône App Store (sans transparence)
│   └── screenshots/              # iphone-01..06 (1290×2796), ipad-01..04 (2048×2732), légendes intégrées
├── android/
│   ├── fiche-play-store.md       # textes Play Console (projet android/ à générer d'abord)
│   ├── icon-512.png
│   ├── feature-graphic-1024x500.png
│   └── screenshots/              # android-01..06 (1080×2160)
├── raw/                          # captures brutes sans légende, mêmes écrans, si un autre habillage est souhaité
└── politique-de-confidentialite.md   # à publier sur https://profood-app.com/confidentialite AVANT la soumission
```

Régénérer les captures : `npx vite preview --port 4173` puis rejouer les commandes agent-browser (viewport 430×932@3 iPhone, 1024×1366@2 iPad, 360×720@3 Android) et le script de composition ; les légendes sont dans le script (`CAPTIONS`).
