# Google Play release preparation

Package: com.infinitystudio.movieapp
Current app name: rn-movie-app (confirm the public name before submitting).
New, unpublished app. Local build and signing; no Expo cloud account required.

## Build
- npm install
- npm run typecheck
- npm test
- npm run build:android:apk (installable release preview)
- npm run build:android:local (signed Play Android App Bundle)
The scripts use the installed JDK/SDK, generate Android source from app.json, and
load signing credentials from .credentials/signing.json into process environment.
Secrets are not stored in Gradle/app source or packaged in the app.
Release builds fail explicitly if upload signing is missing instead of using the
development debug key. The same upload key must be retained for future releases.
Back up the entire .credentials directory privately before uploading the first AAB.
Never share, commit, or upload that directory with app source.

Expected artifacts:
android/app/build/outputs/apk/release/app-release.apk
android/app/build/outputs/bundle/release/app-release.aab
Preview APKs are for review; upload the AAB to Play.

## Default features
Movie discovery/search/details via the configured TMDB token; licensed free film
playback for Big Buck Bunny and Sintel; persistent saved list; device-local profile
name; optional search-statistics consent off by default; Instagram Reels and
YouTube Shorts browsing in external apps/browsers without paid discovery APIs.
Only verified free films display a free-playback action. Other movies show details.
Stories & rewards is a labelled demo with sample story search, episode playback,
favourites, resume progress, viewing history, daily check-ins, points and simulated
withdrawals. No cash payouts, bank-data collection or advertising SDK is enabled.
Do not advertise this build as a cash-earning app. A real drama catalogue and
production rewards require separate content and backend/provider setup.
Instagram/YouTube browsing may require provider login and remains subject to
provider restrictions. An unlimited Instagram feed inside this app is not provided.
Optional oEmbed/discovery backend configuration is documented in INSTAGRAM.md.

## Before Play submission
1. Confirm app name, permanent package, publisher identity and support contact.
2. Replace PRIVACY_POLICY.md's owner/contact placeholders with accurate information
   and publish it at a public HTTPS URL. Enter that URL in Play Console. Profile
   contains an in-app privacy summary; update it if backend/data behavior changes.
3. Review DATA_SAFETY.md against your actual TMDB/Appwrite/backend configuration,
   including provider logging and retention. Do not claim no data collection:
   searches leave the device when movie discovery is used.
4. Complete content-rating and target-audience questionnaires honestly based on
   discoverable movie content and external provider access. This is not prepared as
   a child-directed app. Do not invent a rating.
5. The app contains no ad SDK, purchases or account-creation flow. Reflect this
   accurately in Play declarations and re-review if features are added.
6. Use Play App Signing and retain the local upload key. Increase android.versionCode
   in app.json for every subsequent upload. The first prepared version is code 1.
7. Upload the signed AAB to Internal testing first. Verify on more than one device,
   including Android 16 and 16 KB page-size devices, before production.
8. If your personal Play account was created after 2023-11-13, complete the required
   closed test: at least 12 continuously opted-in testers for at least 14 days, then
   apply for production access. Account eligibility must be checked in your console.
9. Add genuine device screenshots, a 512x512 icon, feature graphic and accurate
   store descriptions. Do not claim all movies stream for free or infinite in-app
   Instagram playback. The existing icon must be reviewed for ownership and quality.
10. Review the remaining upstream dependency advisories in SECURITY_REVIEW.md.
    Passing builds/tests do not certify an app free of security or policy issues.

## Sources (verified 2026-10-14)
Google Play API 36 requirement:
https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-EN
Expo SDK 54 (Android compile/target 36 and React Native 0.81):
https://docs.expo.dev/versions/v54.0.0/
16 KB native-library requirements:
https://developer.android.com/guide/practices/page-sizes
Google Play privacy/data policy:
https://support.google.com/googleplay/android-developer/answer/10144311?hl=en-GB
New personal-account testing:
https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-en
TMDB attribution/non-commercial API licensing:
https://developer.themoviedb.org/docs/faq

No store upload or public publication has been performed.

The local Bundle command also produces the signed release APK in the same Gradle run.
Appwrite native file-system imports use Expo's documented legacy adapter; see ANDROID.md.
