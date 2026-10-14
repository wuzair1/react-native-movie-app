# Data safety preparation — owner review required

This is a code-derived worksheet, not a completed Play Console declaration.
Review actual vendor/backend logging and your deployment before submission.

- Display name and saved list: device-local private storage; not transmitted by
  this app's profile/save feature. Android automatic backup disabled.
- Movie search queries: transmitted to TMDB for app functionality. Assess and
  declare the applicable App activity / in-app search history category. Do not
  describe all search data as device-only.
- Optional Appwrite search statistics: search term, matched movie ID/title/poster
  URL/count. Off by default; opt-in control in Profile. Assess analytics purpose,
  sharing definitions, processing arrangements, retention and deletion.
- Network metadata: service/CDN operators can see IP/request information. Evaluate
  provider policies; the app does not explicitly request location or device IDs.
- External Instagram/YouTube app/browser use: distinguish the external provider's
  account handling from this app. No passwords/tokens collected for free browsing.
- Optional embedded player/backend: if enabled, review submitted URLs/queries,
  embedded Instagram cookies and the publisher's server logs. Default free flow
  requires neither backend.
- No ad SDK, in-app purchase flow, account registration, contact access, microphone,
  camera, or storage/media runtime permission is requested by these features.
- HTTPS used for app-owned service calls. Deletion of saved list is available
  locally. Remote analytics deletion/retention needs the publisher's real process.
- Complete content rating, target audience, app access and privacy-link fields.
  A public privacy policy and support contact are still required.
- Re-check all declarations whenever enabling a backend, ads, authentication or
  any new SDK. Play's definitions determine whether provider transfers count as
  collection/sharing; this worksheet does not replace those definitions.
