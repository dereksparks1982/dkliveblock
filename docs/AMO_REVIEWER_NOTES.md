# DK Live Block: Firefox Add-ons reviewer notes (draft)

**Source version:** Build 220 / 0.3.190 (unreleased). **Submission status: BLOCKED until owner approves and the complete local and Firefox test gates pass.**

This document is for the **Firefox Add-ons human/automated review team** when the owner later submits a listing. Nothing in this document represents an approved or uploaded extension.

## Purpose and user-facing behavior

DK Live Block is a Firefox-first ad and tracker blocker. It applies bundled and subscription-based network rules, conservative page hiding, optional site-local exceptions, popup controls, and privacy-safe local request inspection. It has optional YouTube metadata filtering and media-health diagnostics. It does not guarantee removal of every streaming or server-side ad. The normal blocking engine is bundled and needs no separately installed helper.

User-observed Firefox sessions have successfully blocked ads in ordinary YouTube videos, movies offered "Free with Ads", Disney+ movies and CSI: Las Vegas, and unwanted ads/popups on 1337x and The Pirate Bay. Details are in `docs/QA_LAB.md`. These sessions are **not** a broad independent compatibility test.

## Third-party code and reviewer source pointers

- **Bundled Ghostery adblocker:** npm package `@ghostery/adblocker` **2.20.3**, repository `https://github.com/ghostery/adblocker`. The official npm package and its readable source must be used for reviewer comparison. The repository-owned bundle is `src/ghostery-vendor.js`, built by `scripts/build-ghostery.mjs`, entry `scripts/ghostery-vendor-entry.mjs`, using `esbuild` **0.25.12**. Original package source is MPL-2.0; the bundled license is `src/LICENSE-GHOSTERY.txt`. Bundling is not permission to relicense it under DK's custom terms.
- **Mozilla Public Suffix List:** `vendor/public_suffix_list.dat`, generated runtime asset `src/public-suffix.js`, `scripts/update-psl.py`, license `src/LICENSE-PSL.txt` (MPL-2.0). Canonical upstream `https://publicsuffix.org/list/`.
- **Filter subscriptions:** EasyList, EasyPrivacy and optional publisher-managed filter lists are treated as filter data, never as downloaded executable code. Their licenses and original publisher URLs must be checked before submission.

Any code/source archive attached for AMO review must contain **the full readable sources and lockfile**, not just the packaged extension. No private browsing logs, browser profile, credentials, or user reports should be bundled.

## Rebuild instructions (Ubuntu Linux, for review; NOT executed in this document)

**Known blocker:** `package-lock.json` is not yet present in the current repository. The owner must generate, review, and commit a valid npm lockfile for the pinned dependencies, then verify that rebuilding Ghostery reproduces the checked-in `src/ghostery-vendor.js` exactly. Until then **a reproducible source submission is NOT verified**.

Once the repository contains a complete reviewed lockfile, the reviewer can use an exact accepted source tag and run from the source root:

1. `npm ci --ignore-scripts` (if the required esbuild native package is unavailable with ignored scripts, use normal `npm ci` and document the environment). Use only official npm registry packages.
2. `npm run build:ghostery` to regenerate the bundled engine.
3. `bash scripts/test-local.sh` for the local seven-phase test gate (Node and Python).
4. Only after owner approval, `python3 scripts/package-firefox.py --candidate` for a reproducible unsigned browser ZIP. The package builder checks the full suite and source preflight first.

**IMPORTANT:** these steps describe the intended build, not a certificate that dependency versions or byte-for-byte reconstruction have passed. The build uses pinned npm dependency specifications but must have a lockfile and a measured hash match. Reviewers may require additional third-party component notices and permissions explanations.

## Permissions and privacy disclosures

- `webRequest`, `webRequestBlocking`, `<all_urls>`: inspect URLs and apply local ad/tracker rules at request time. `tabs`, `webNavigation`, `contextMenus`: site controls, user gestures and source-bound popup protection.
- `storage`, `alarms`: user preferences, cached rule lists and scheduled data-only updates. `browserSettings`: browser setting controls. `proxy`, `dns`: optional user-selected routing and explicit DNS diagnostics. `devtools`, `nativeMessaging`: optional extended functions; the base ad blocker works without a separately installed helper.
- No advertising insertion, promotional messages, Acceptable Ads, paid features, DK LAB telemetry or automatic email reporting.
- Downloading filter-list data and the opt-in YouTube rules or phishing data feed contacts their publishers, which can observe ordinary connection metadata. On-demand public domain/DNS/RDAP investigations contact external services only when requested. See `docs/PRIVACY.md` for the full draft disclosure; it requires exact candidate validation.

## Review environment, licensing and outstanding acceptance

The original DK Live Block code is supplied under the [Free Use / No Monetization License](../LICENSE), a **custom source-available license** allowing free company use but not selling/repackaging DK's material. Previously distributed MIT-licensed copies retain their past permissions. Embedded MPL-2.0 materials retain the upstream terms. Mozilla's license selection and legal-review compatibility must be checked.

The project uses Firefox Manifest V2 for Firefox, and the Gecko ID is `dk-live-block@elderred-softworks.local`. All packaged code is intended to be local and self-contained. No Google Chrome compatibility is claimed.

**Owner action:** create/confirm AMO developer account, approve the exact candidate build, review screenshots/listing/privacy/permission descriptions, and upload the unsigned package and source package. No automated publication is authorized.

**Known open gates:** current seven-phase suite, full Firefox clean-profile/regression/long-session coverage, exact Ghostery reproduction, locked dependencies, license and upstream attribution, privacy policy and permission validation, user approval, and AMO validation/review. Mozilla review timing is outside our control.
