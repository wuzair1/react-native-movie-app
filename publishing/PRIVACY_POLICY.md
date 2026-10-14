# Privacy policy — rn-movie-app

Draft for owner review. Do not publish with placeholders.
Effective date: 2026-10-14
App package: com.infinitystudio.movieapp
Publisher: [YOUR PUBLISHER NAME]
Privacy contact: [YOUR SUPPORT EMAIL OR CONTACT PAGE]

The app helps users discover movies, keep a saved list, watch selected licensed
free films, and open Instagram or YouTube content.

## Data stored on your device
Your display name, saved movie list and search-statistics preference are stored
in the app's private device storage. They are not sent to an account/profile server.
Android automatic app backup is disabled. Saved items can be removed individually
or cleared in Profile. Removing the app normally removes its private stored data.

The entertainment demo also stores sample viewing progress and a simulated
points/withdrawal ledger on this device. These have no cash value and are not
sent to a payment server. No banking details are requested. Removing the app
removes this local demo data.

## Movie discovery and playback
When you browse/search movie data, search queries and movie identifiers are sent
to TMDB over HTTPS. Images are retrieved from TMDB's CDN; placeholder image
requests can go to placehold.co when a movie lacks an image. Film playback and
source pages request media from Internet Archive and its delivery hosts.
These providers receive network information such as IP address and request details.
Their logging, retention and privacy practices are governed by their own policies.
TMDB: https://www.themoviedb.org/privacy-policy
Internet Archive: https://archive.org/about/terms.php

## Optional statistics
Search-statistics sharing is off by default. If you enable it in Profile and the
publisher has configured the analytics service, the app sends search terms and
matching movie information to that service (currently Appwrite). The app does not
send the display name or saved list with these events.
Turning the setting off stops future events; it does not erase previously sent
events. Contact the publisher about server-side retention and deletion.
Publisher must complete: [ACTUAL ANALYTICS RETENTION AND DELETION PROCESS].

## External video services and optional embedding
Browsing Reels or Shorts opens Instagram or YouTube in the system app/browser.
The selected provider may require login and applies its own privacy policy.
This app does not collect Instagram/Google account passwords.
If the publisher enables an optional embed/discovery backend, submitted Reel
URLs or clip queries go to that backend, and embedded content can use Instagram
cookies and third-party network requests.
Publisher must disclose enabled backends and their retention before deployment:
[ENABLED BACKENDS AND RETENTION, OR STATE THAT THEY ARE DISABLED].

## Security and retention
App service requests use HTTPS. Signing secrets and server credentials are not
included in the app source or APK. Client movie-data access configuration is
bundled in the app; it is not a private server credential.
Local profile/list data remain until changed, cleared, or removed with the app.
Provider-held information follows the configured provider's retention policies.
No security method can guarantee complete protection.

## Changes and inquiries
Changes to actual data practices must be reflected here and in Play's Data safety
declarations before distributing the corresponding release.
Contact [YOUR PRIVACY CONTACT] with questions or data requests.
