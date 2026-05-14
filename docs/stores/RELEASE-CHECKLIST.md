# Profood — Store release checklist

What's already wired up vs. what still needs human action (accounts,
certs, art) for each app.

## Bundle identifiers

| App        | iOS bundle                  | Android applicationId       |
|------------|-----------------------------|-----------------------------|
| Customer   | `com.profoodapp.app`        | `com.profoodapp.app`        |
| Livreur    | `com.profoodapp.livreur`    | `com.profoodapp.livreur`    |

Same id on both platforms — keep it that way; switching mid-flight
breaks store linkage.

## Versioning

Bump these together for every release:

| File                                          | What to change                      |
|-----------------------------------------------|-------------------------------------|
| `ios/App/App.xcodeproj/project.pbxproj`       | `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` (build number, must increment) |
| `android/app/build.gradle`                    | `versionCode` (integer, +1 each release), `versionName` (semver) |
| `package.json`                                | `version` (just for clarity)        |

The customer app's Android target has been at `versionCode 9` historically;
keep climbing from there. Livreur starts at `versionCode 1`.

## iOS — ready

- Both apps' Info.plist now contains `ITSAppUsesNonExemptEncryption=false`,
  which skips the encryption-export-compliance question at submission.
- Both apps now include `PrivacyInfo.xcprivacy` declaring:
  - No tracking
  - Collected data types: Name, Phone, Email, Precise Location (all
    linked to user identity, all for App Functionality, no tracking)
  - Required-reason APIs: UserDefaults (CA92.1), File timestamp (C617.1),
    System boot time (35F9.1), Disk space (E174.1) — the standard set
    Capacitor triggers
- Livreur app: `NSFaceIDUsageDescription` + `NSLocationWhenInUseUsageDescription`
- Customer app: `NSLocationWhenInUseUsageDescription`

## iOS — still needed (human action)

- Apple Developer account ($99/year) per company
- App Store Connect record for each app
- App icons in `Assets.xcassets/AppIcon.appiconset/` (1024×1024 master,
  no transparency, no rounded corners — Apple rounds them)
- Launch storyboard + `Splash.imageset` matching the brand
- Provisioning profile + distribution certificate
- Screenshots: 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11 Pro Max) at
  minimum. iPad if the app supports it (both apps declare iPad
  orientations — either drop the iPad orientations from Info.plist or
  provide iPad screenshots)
- Privacy policy URL (see `PRIVACY-POLICY-TEMPLATE.md`)
- App Store listing copy (see `STORE-LISTINGS.md`)
- Submit via Xcode → Archive → Distribute App, or via `fastlane deliver`

## Android — livreur ready

- Release signing config in `android/app/build.gradle` reads
  `keystore.properties` (gitignored) and falls back to debug-signing when
  the file is missing
- `keystore.properties.example` documents the expected keys
- `.gitignore` updated to exclude `*.jks`, `*.keystore`, `keystore.properties`
- targetSdk 35, minSdk 23 — current Play Store requirements (Aug 2024+)

## Android — still needed (human action)

- Google Play Developer account ($25 one-off)
- Play Console app record for the livreur app
- Generate the keystore:
  ```
  keytool -genkey -v -keystore profood-livreur-release.jks \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -alias profood-livreur
  ```
  Store it OUTSIDE the repo, back it up to a vault. Losing it = losing
  the ability to update the app.
- Adaptive icon: `android/app/src/main/res/mipmap-*/` (foreground +
  background layers) — currently shipping the Capacitor default
- Splash assets in `android/app/src/main/res/drawable-*/` if you want
  a branded splash
- Screenshots: phone (1080×1920 min), 7" tablet, 10" tablet if relevant
- Build AAB: `cd android && ./gradlew bundleRelease` → AAB at
  `android/app/build/outputs/bundle/release/app-release.aab`
- Upload to Play Console (Internal testing track first)

## Android — customer app blocker

`profood-app/android/app/src/main/` is empty: the scaffold exists
(`build.gradle`, gradle wrapper, etc.) but the source files
(AndroidManifest.xml, MainActivity, res/) were never committed. The
historical `versionCode 9` in build.gradle suggests a previous working
state that was lost (likely during the iCloud git-corruption episode
documented in monorepo consolidation).

Two routes:
1. Run `npx cap add android` to regenerate from the Capacitor template,
   then re-customise (display name, permissions, icon, etc.).
2. Recover from a backup if available (see `~/Projects/profood-backups/`
   from the 2026-04-09 backup batch).

Either way, the Android customer build needs separate work before the
release flow above applies to it.

## Mobile shell sanity check before submit

| Item                     | Customer | Livreur     |
|--------------------------|----------|-------------|
| iOS app icon (1024)      | TODO     | TODO        |
| iOS launch storyboard    | Default  | Default     |
| iOS PrivacyInfo          | Ready    | Ready       |
| iOS usage descriptions   | Location | Face ID, Loc|
| Android icon (adaptive)  | TODO     | TODO        |
| Android signing config   | n/a      | Ready       |
| Privacy policy URL       | TODO     | TODO        |
| Store screenshots        | TODO     | TODO        |
| Listing copy             | Drafted  | Drafted     |
