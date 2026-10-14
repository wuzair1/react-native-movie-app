# Dependency security review

Snapshot: 2026-10-14. This report records remaining work; it is not a security certification.

The Expo SDK 52 / React Native 0.76 project was migrated to SDK 54 / React Native
0.81.5 to meet API 36 submission requirements and use a native toolchain with
modern page-size support. Compatible npm audit fixes were applied, including
an updated Reanimated 4.1.x installation. No forced SDK/React/NativeWind major
versions were installed merely to suppress audit output.

The npm audit includes development tools shipped as dependencies of Expo,
Metro, Jest and Tailwind. Such a dependency being labeled "production" by npm
does not establish whether its code is in the Android runtime bundle.
Remaining findings must be evaluated against actual release assets and build use.

Notable upstream findings in the audit:
- braces nested-pattern stack exhaustion (GHSA-vfj7-8cjw-p6xm). Latest registry
  release inspected was 3.0.3, still in the advisory range. Do not feed untrusted
  glob/pattern input into the build toolchain.
- node-forge signature-verification advisory (GHSA-86w9-cpqp-85rv). Latest registry
  release inspected was 1.4.0, still in the advisory range. The local Android
  upload signer uses Java keytool/Gradle, not a custom node-forge verifier.
- sprintf-js unbounded-precision denial of service (GHSA-hp3w-g68c-fv3c).
  Latest inspected 1.1.3 remained in the advisory range.
- decode-uri-component malformed-input decoding denial of service
  (GHSA-vcc3-ghjq-m6fr). Patched latest version changes to ESM; do not blindly
  substitute it under an older CommonJS query-string consumer.
- image-size parser denial-of-service advisories. Patched v2 changes the default
  API used by this Metro version. Do not override its major version without
  adapting and validating all image-processing consumers.
- uuid buffer-bounds advisory affects older tooling consumers; upgrading
  across major versions requires reviewing each consumer's API/runtime support.
- PostCSS and selector parsing advisories are being addressed with patched
  versions followed by typecheck, unit tests and native bundling.

There is no unchecked runtime use of user-provided glob patterns, CSS, certificates,
or image files in the implemented product flows. This observation does not remove
the advisories or guarantee absence of exploit paths. Build dependencies should
be used only with trusted project source/assets.

Before production, review the current audit JSON under .expo and assess remaining
findings, patched upstream releases, toolchain upgrades and mitigations. Do not
describe this app as vulnerability-free. Keep npm audit output and a dependency
lockfile with the release review. No advisory was hidden by changing severity,
fabricating package versions or discarding source validation.

Runtime malformed-URI mitigation:
scripts/postinstall.cjs reproducibly replaces the legacy CommonJS
decode-uri-component 0.2.2 recovery path with scripts/safe-uri-decoder.cjs.
Valid URI/Unicode/plus decoding uses the platform decoder. Invalid input stays
raw after one failed attempt, rather than recursively attempting partial recovery.
Regression tests exercise the installed decoder, including malformed repeated
input and valid Unicode. The package version is not falsified; npm still reports
the underlying advisory. Rebuild release JavaScript after applying this guard.
Future SDK/dependency updates must revisit or remove the adapter when a compatible
patched upstream decoder is used. This does not clear unrelated audit findings.

Native dependency alignment:
Appwrite's file-system dependency resolves to Expo's single 19.0.24 module; its
imports use the documented legacy adapter. react-native-svg is declared directly.
Expo Doctor passed all 18 checks after these changes.
