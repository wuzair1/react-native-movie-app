# Instagram Reels: chosen free browsing setup

No Meta developer account, access token, backend or paid generation credits are
required for the default app flow. Reels > Browse Reels on Instagram opens the
official Reels page in the system app/browser. Paste a single public Reel URL and
Open Reel on Instagram validates it before opening it. Instagram controls browsing
and playback and may require login, consent, or impose content restrictions.
This does not provide an unrestricted infinite Instagram API feed inside the app.

## Validation and safety
The pasted URL must be HTTPS, an exact instagram.com/www.instagram.com host, and
/reel/SHORTCODE/. Credentials, nonstandard ports, lookalike hosts and other path
formats are rejected. Tracking parameters are removed.
Network requests are asynchronous; repeated Play taps cannot duplicate requests.
Requests cancel on navigation/background, with timeouts and error messages.
Optional WebView HTML is reconstructed from a matching verified permalink in the
oEmbed HTML; arbitrary returned scripts/attributes/inner content are discarded.
Only the fixed Instagram embed.js script is included. JavaScript and third-party
cookies support the official player; file access/mixed content are disabled.
Instagram HTTPS navigation stays in the WebView; other HTTPS links open externally,
while intent/file/javascript schemes are blocked. Player removal handles lifecycle.

## Optional oEmbed integration
Set EXPO_PUBLIC_INSTAGRAM_OEMBED_ENDPOINT only to your deployed HTTPS backend route.
Leaving it unset selects free external opening.
The backend reference is backend/instagram-oembed.mjs (Node 20+):
- META_GRAPH_VERSION: explicitly required, in vNUMBER.0 format.
- META_OEMBED_ACCESS_TOKEN: optional server-only credential if current Meta docs
  require it. Provision it through Meta's supported administrator/auth process.
- PORT: optional, defaults to 8787.
Run node backend/instagram-oembed.mjs behind an HTTPS reverse proxy.
POST /instagram/oembed accepts {"url":"https://www.instagram.com/reel/SHORTCODE/"};
success returns {"html":"Meta embed HTML"}. It calls only the fixed Meta Graph host.
Apply deployment authentication, per-client rate limits, connection/body timeouts
and concurrency limits at the gateway. Do not log token-bearing upstream URLs.
Never place Meta tokens/app secrets in EXPO_PUBLIC_ settings or in the APK.

## Official API verification gap
The requested Meta documentation repeatedly returned HTTP 429 during this task:
https://developers.facebook.com/docs/instagram-platform/oembed/
Current supported version, parameters and authentication requirements could not be
verified from that official page. The backend deliberately has no version default.
Before enabling it, verify graph.facebook.com/{version}/instagram_oembed and the
url/omitscript parameters against current official documentation.
Complete any required Meta oEmbed Read access/review/app-mode configuration there.
Do not assume historical token requirements or tokenless support remain applicable.
Live Meta embedding has NOT been tested. The optional backend is not a certified
production Meta integration; the chosen free browsing path needs none of it.

## Tests
1. Open Reels > Instagram Reels > Browse Reels on Instagram.
2. Paste an actual https://www.instagram.com/reel/SHORTCODE/ link and open it.
3. Try bad domains, /p/ URLs, HTTP and invalid text; verify clear validation errors.
4. Return from Instagram/browser; check navigation and the existing movie tabs.
5. Test private/deleted/embedding-disabled content on Instagram without bypassing it.
6. For optional embedding, first configure/verify the backend and Meta requirements.
   Confirm the official player renders on device and tap its controls to start.
   Check audio, fullscreen, cookies/login, offline/retry and background/blur cleanup.

Public does not guarantee embeddable. Restrictions, deletion, cookies, region,
rate limits, permissions and embedding preferences affect availability.
The app neither extracts private video URLs nor promises direct native Reel playback.
A WebView load event does not prove cross-origin Instagram playback succeeded.

## Files
services/instagram.ts; components/InstagramReelPlayer.tsx; app/(tabs)/reels.tsx;
backend/instagram-oembed.mjs; services/__tests__/instagram.test.ts;
app.json; .env.example; .gitignore; ANDROID.md.
Ignored backups preserve the original Reels files; they can contain old credential-like
values. Do not publish backups. Rotate any real credential previously hardcoded or shipped.
