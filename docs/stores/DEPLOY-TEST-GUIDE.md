# Profood — Guide de déploiement pour tests stores

Mis à jour : 2026-05-27. Cible : faire passer le **livreur** sur
TestFlight et Play Console Internal Testing. Le customer attend
l'upgrade Capacitor 5→7 pour Play Store (SDK 35) mais peut déjà être
sideloadé pour tests internes.

## Récap blocages restants (humain)

| Item                                | Livreur                          | Customer                                |
|-------------------------------------|----------------------------------|-----------------------------------------|
| Compte Apple Developer ($99/an)     | requis                           | requis                                  |
| Compte Play Developer ($25 one-off) | requis                           | bloqué tant que SDK 33                  |
| Keystore Android                    | à générer                        | à générer                               |
| Icône iOS 1024 brand                | placeholder en place             | placeholder en place (copie livreur)    |
| Splash iOS brand                    | placeholder en place             | placeholder en place                    |
| Icône Android adaptive brand        | défaut Capacitor                 | défaut Capacitor                        |
| Screenshots stores                  | à faire (6.7" + 6.5" iOS, phone Android) | idem                          |
| Privacy policy URL en ligne         | à publier sur profood-app.com    | idem                                    |
| App Store Connect record            | à créer                          | à créer                                 |
| Play Console app record             | à créer                          | reporté                                 |

Tout le reste (Info.plist, PrivacyInfo, signing config, manifest,
permissions) est en place côté code.

---

## 1. iOS — TestFlight livreur

### Pré-requis
- Apple Developer enrôlé pour `mediapex` / Profood
- Xcode 16.x sur la machine
- Bundle ID `com.profoodapp.livreur` créé sur https://developer.apple.com/account/resources/identifiers/list
- App créée dans App Store Connect (https://appstoreconnect.apple.com/apps) → "Nouvelle app" → bundle `com.profoodapp.livreur`, nom "Profood Livreur"

### Build pour TestFlight
```bash
cd /Users/ibrahima/Projects/profood/profood-livreur-app

# Build web pointant vers l'API prod (par défaut https://api.profood-app.com/api/)
# Si vous utilisez encore localhost en dev, FORCEZ l'URL prod :
VITE_API_URL=https://api.profood-app.com/api/ npm run build
npx cap sync ios
npx cap open ios
```

Dans Xcode :
1. Onglet "Signing & Capabilities" → Team = votre équipe Apple
2. Bumper `MARKETING_VERSION` (ex: 1.0.0) et `CURRENT_PROJECT_VERSION` (ex: 1) dans le project settings
3. Selector destination → "Any iOS Device (arm64)"
4. Product → Archive
5. Window → Organizer → sélectionner l'archive → Distribute App → App Store Connect → Upload
6. Attendre 10-30 min le traitement App Store Connect

### Activer les testeurs internes
1. App Store Connect → votre app → TestFlight
2. Section "iOS" → la build apparaît dès la fin du traitement
3. Compléter "Test Information" (au minimum email contact)
4. Internal Testing : ajouter votre Apple ID + ceux des testeurs Profood (utilisateurs déjà dans App Store Connect)
5. Pas de review Apple pour internal testing — disponible dès l'invitation

### Première soumission (External / Store)
- Required : informations export crypto déjà skippées via `ITSAppUsesNonExemptEncryption=false`
- Required : screenshots 6.7" (iPhone 15/16 Pro Max) + 6.5" (iPhone 11 Pro Max)
- Required : Privacy Policy URL
- Required : description, mots-clés, support URL (voir `STORE-LISTINGS.md`)

---

## 2. Android — Play Console Internal Testing livreur

### Pré-requis
- Compte Google Play Developer ($25 one-off) enrôlé
- Java 17 JDK installé localement (pour keytool + gradle)
- Android Studio installé (ou Android command-line tools)

### Générer le keystore (UNE SEULE FOIS — backup vital)
```bash
cd /Users/ibrahima/Projects/profood/profood-livreur-app/android
keytool -genkey -v \
    -keystore profood-livreur-release.jks \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias profood-livreur

# Renseignez :
#   - keystore password : long mot de passe, à stocker en lieu sûr
#   - first/last name, organization, city, country
#   - key password (peut être identique au keystore password)
#
# Sortie : profood-livreur-release.jks (DÉJÀ gitignoré)
# Sauvegarde IMMÉDIATE dans 1Password / coffre — perdre cette clé = perdre l'app
```

Créer `android/keystore.properties` (DÉJÀ gitignoré) :
```properties
storeFile=profood-livreur-release.jks
storePassword=LE_MOT_DE_PASSE_DU_KEYSTORE
keyAlias=profood-livreur
keyPassword=LE_MOT_DE_PASSE_DE_LA_CLE
```

### Générer l'AAB signé
```bash
cd /Users/ibrahima/Projects/profood/profood-livreur-app
VITE_API_URL=https://api.profood-app.com/api/ npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# AAB produit : android/app/build/outputs/bundle/release/app-release.aab
# Vérifier la signature :
./gradlew :app:signingReport
```

### Créer l'app sur Play Console
1. https://play.google.com/console → "Create app"
2. Nom : "Profood Livreur", langue : Français, type : App, gratuite
3. Accepter déclarations (politique contenu + export US)
4. Dashboard → Setup → tous les blocs verts (privacy policy, content rating, target audience, data safety, etc.)
5. **Production track** pas nécessaire pour testing — descendez à "Testing → Internal testing"

### Première upload Internal Testing
1. Testing → Internal testing → "Create new release"
2. Drop l'AAB
3. Release name auto, Release notes en FR
4. "Save" puis "Review release" puis "Start rollout"
5. Onglet "Testers" → créer une liste email (max 100 testeurs internes)
6. Copier le "Opt-in URL" → envoyer aux testeurs
7. Testeurs : ouvrir le lien depuis le compte Google enregistré → "Become a tester" → app dispo sur Play Store dans ~15 min

---

## 3. Customer app — sideload uniquement (pour le moment)

L'app customer ne peut pas aller sur Play (SDK 33 < 35 requis depuis
Aug 2024). Pour TestFlight elle est techniquement archivable maintenant
que les assets iOS sont en place, mais ce sera de la dette à régler avec
l'upgrade Capacitor 7.

### iOS — Ad Hoc (sans TestFlight)
```bash
cd /Users/ibrahima/Projects/profood/profood-app
CI=false npm run build
npx cap sync ios
npx cap open ios
```
Dans Xcode : Archive → Distribute App → Ad Hoc → exporter IPA →
distribuer via Diawi (https://www.diawi.com) ou Firebase App
Distribution. Limité aux UDID iPhone enregistrés dans le profil
provisioning.

### Android — APK debug-signed
Sans keystore configuré, gradle produit un APK release auto-signé en
debug, installable directement :
```bash
cd /Users/ibrahima/Projects/profood/profood-app/android
./gradlew assembleRelease
# APK : android/app/build/outputs/apk/release/app-release-unsigned.apk
# (renommer en release et installer via adb install)
```

Si vous voulez le pousser sur Firebase App Distribution :
- générer un keystore comme pour le livreur
- créer `android/keystore.properties`
- `./gradlew bundleRelease` produira un AAB signé
- upload via Firebase Console → App Distribution

---

## 4. Checklist par release

À chaque nouvelle build :

- [ ] Bumper version (iOS pbxproj `MARKETING_VERSION` + `CURRENT_PROJECT_VERSION`, Android `versionCode` +1 et `versionName`)
- [ ] `npm run build` réussit sans warning bloquant
- [ ] `VITE_API_URL` (livreur) ou config axios (customer) pointe vers `https://api.profood-app.com/api/`
- [ ] `npx cap sync` réussit
- [ ] Test rapide sur simulateur/émulateur
- [ ] iOS : Archive depuis Xcode + upload
- [ ] Android : `./gradlew bundleRelease` + upload AAB
- [ ] Release notes rédigées (FR + EN si bilingue)
- [ ] Tag git : `git tag livreur-v1.0.1 && git push --tags`

---

## 5. Diagnostic rapide en cas d'échec

| Symptôme                                       | Cause probable                                  |
|------------------------------------------------|-------------------------------------------------|
| Xcode "no AppIcon found"                       | `Assets.xcassets/AppIcon.appiconset/` vide      |
| Xcode "code signing required"                  | Team pas sélectionnée dans Signing & Capabilities |
| App Store Connect "Invalid Bundle"             | Bundle ID pas créé sur developer.apple.com      |
| App Store Connect "Missing PrivacyInfo"        | `PrivacyInfo.xcprivacy` pas ajouté au build phase Resources |
| Play Console "Targeting outdated API level"    | `compileSdk`/`targetSdk` < 35 (customer)        |
| Play Console "App not signed"                  | `keystore.properties` absent ou mal renseigné   |
| Play Console "Crypto export compliance"        | Déjà géré pour iOS (`ITSAppUsesNonExemptEncryption=false`), pas requis Android |
| `pod install` échoue après cap sync            | `cd ios/App && pod repo update && pod install` |

---

## 6. Liens utiles

- App Store Connect : https://appstoreconnect.apple.com/
- Apple Developer : https://developer.apple.com/account/
- Play Console : https://play.google.com/console/
- Firebase App Distribution : https://console.firebase.google.com/ → projet → App Distribution
- Diawi (iOS Ad Hoc + Android APK) : https://www.diawi.com
- Privacy Policy template Profood : `docs/stores/PRIVACY-POLICY-TEMPLATE.md`
- Store listings drafts : `docs/stores/STORE-LISTINGS.md`
