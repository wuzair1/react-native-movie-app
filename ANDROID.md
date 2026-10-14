# Android development and Google Play builds

The app uses Expo SDK 54 / React Native 0.81.5 and TypeScript with Expo Router.
Android source is generated from app.json by Expo prebuild. Package:
com.infinitystudio.movieapp. Generated MainActivity is Kotlin, module android/app.
Android compile/target SDK: 36. Keep the permanent package for future releases.

## Setup and local development
Run npm install, copy .env.example to .env, and configure the existing TMDB Read
Access Token for movie discovery. Free film playback and external Reels/Shorts
browsing do not require paid discovery APIs or Meta credentials.
Run npm run android:native with JDK 17+, the Android SDK and an emulator/device.
SDK 54-compatible native builds are preferred for device testing.
All EXPO_PUBLIC_ values are bundled into the app; never put server secrets there.

## Appwrite compatibility
Search statistics are optional and off by default until enabled in Profile.
Existing Appwrite project/database/collection configuration remains supported.
The SDK's old native file-system dependency is aligned to Expo 19.0.24 through
the dependency override and scripts/appwrite-filesystem-compat.cjs postinstall.
The script changes only Appwrite file-system imports to expo-file-system/legacy,
the backward-compatible API documented by Expo. npm install reapplies this
adaptation reproducibly. Do not remove the postinstall step without migrating
Appwrite's file API or its dependency requirements.
The configured collection needs searchTerm, movie_id, title, count and poster_url
and appropriate indexes. Do not grant unrestricted production write access merely
to make analytics work; use an authenticated backend for robust public statistics.

## Features
- Movie discovery/search/details with validated responses, network timeouts and retry.
- Watch for free: Big Buck Bunny and Sintel, with creator/license/source credits.
  Other movies show details and streaming availability rather than an unverified
  universal streaming embed. TMDB catalog entries are not playback licenses.
- Saved movies and display name persist locally. Profile offers deletion and
  optional search-statistics consent. Android automatic backup is disabled.
- Reels opens Instagram, or validates and opens a pasted Reel URL for free.
- Shorts and trending clips open YouTube searches. No paid discovery key required.
- Optional official oEmbed backend/player: see INSTAGRAM.md. Live embedding remains
  unverified until official Meta requirements and a real deployment are validated.

## Local release builds (no Expo cloud account)
npm run build:android:preview produces a signed release APK.
npm run build:android:production produces a signed AAB plus the release APK.
These use scripts/build-android.ps1 and the locally generated upload key in
.credentials. The private directory is ignored by Git and excluded from Metro.
Back it up securely. Never commit or share it. Release builds explicitly fail if
signing is missing instead of shipping a debug-signed release.
See publishing/PLAY_RELEASE.md for Play Console steps and manual prerequisites.

## Validation
npm run typecheck
npm test
npx expo-doctor
npx expo export --platform android

The preserved .task-backups directory is excluded from TypeScript, Jest and Metro.
Workspace temporary/socket directories are excluded from Metro to avoid Windows
sandbox socket-file errors. Build scripts set a process-local short Java socket
directory and limit Gradle workers. No global JVM, registry or SDK policy changes
are required for these build workarounds.

Before publication, validate search, details, free film controls/fullscreen,
background pause, save/restart/remove, profile preferences, external link flows,
offline/retry, hardware Back, small screens and Android 16/16 KB page-size devices.
A JavaScript export is not an APK or proof of device playback.
