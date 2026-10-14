# Reference app scope

Reference: [Lucky Drama: Watch & Earn](https://play.google.com/store/apps/details?id=com.JN.drama.app), reviewed 14 October 2026.

The owner requested all reference functionality. The public listing confirms drama discovery, short episode viewing, advertising, and rewards through eligible activities. Its update notes mention cash earnings. The listing does not establish its internal reward rules, payment provider, episode rights, or screen behavior. Screenshot retrieval failed, so exact visual matching has not been verified.

## Intended implementation

- Drama catalogue with story details and ordered episodes.
- Episode playback, resume progress, favourites, and viewing history.
- Rewards page with an activity ledger and clearly explained eligibility.
- Wallet and withdrawal screens, connected to a real backend when payout requirements are supplied.
- Profile, privacy, support, and account management appropriate to enabled services.
- Original app name, artwork, and branding.

## Approved demo implementation

The owner selected a clearly labelled demo and existing licensed sample videos.
Stories & rewards is accessible from Home and Profile. It provides sample search,
single-episode playback, favourites, resume progress, viewing history, daily UTC
check-in points, one completion award per sample, and a simulated withdrawal
ledger. All points are labelled as having no cash value. No banking details or
advertising SDK are collected or enabled. Sample films are identified as samples,
not presented as an available commercial drama catalogue.

## Required inputs before production cash rewards

Confirm payment provider, supported countries/currencies, payout funding, minimum withdrawal, eligibility, and reward calculation. Balance changes and withdrawals must be authorised and recorded by the backend; device storage cannot establish a redeemable cash balance. No real-money earning claim should be enabled for a demo.

Confirm the catalogue of owned or licensed drama episodes. Existing licensed sample films can exercise playback, but they are not a drama catalogue and must not be described as one.

The reference developer's contact information and privacy declarations do not belong to this project and must not be copied into its Play listing.

## Current validation status

Current project tests: 43 passed, including demo claim uniqueness, overdraft
prevention and persistence of progress/transactions after restart. TypeScript
checks pass. Expo Doctor previously passed all 18 checks. Signed release build
is in progress after fixing the drive-root package lookup error; native output
and on-device visual verification remain pending. Production cash rewards have
not been implemented or tested. Store publication remains pending release
validation and publisher contact/privacy information.
