# DK Live Block cross-browser architecture (Build 239)

## Product architecture
**One repository, one shared engine, three browser-target packages eventually:** Firefox, Google Chrome and Microsoft Edge. Never fork three independent application source trees. Build targets and their prerequisites are described by `platform/targets.json`, not hardcoded into three separate adblock projects.

Browser target selection is a **packaging concern**, not a URL-supplied request. The generated Firefox XPI, Chrome ZIP/store bundle and Edge ZIP/store bundle are separate distributions from the same shared code and filtering data. The correct browser's add-on store distributes the appropriate package. Runtime capability detection then selects safe implementations and diagnostics within that package.

`src/browser-compat.js` is intentionally a read-only runtime capability inspector. It distinguishes Firefox's Manifest V2 blocking webRequest from Chromium Manifest V3 declarativeNetRequest without assuming that Chrome's API of the same name provides synchronous blocking. It can report Firefox, Chrome, Edge or unknown using Firefox runtime identity and browser branding hints, but never makes security decisions or grants permissions from a user agent string.

## Implemented in Build 239
1. A single `platform/targets.json` records all three build targets and their required network mechanisms.
2. A pure, tested `DKBrowserCompat.inspect` capability adapter loads before the current Firefox background controller. Firefox filtering paths, subscriptions and page scripts continue unchanged.
3. `scripts/build-browsers.py --plan` is read-only and shows the three-target matrix. Only a deliberately requested Firefox candidate delegates into the pre-existing strict `scripts/package-firefox.py` with all current source/license/test/vendor gates.
4. Chrome and Edge package generation **fails closed** until their actual MV3 port is finished. Neither fake installable bundles nor silent weakened blocking is acceptable.

## Next work needed before Chrome/Edge output
- Factor out browser-neutral blocking decisions and compare them against the actual Firefox implementation.
- Write a portable rule compiler for `declarativeNetRequest` with explicit dynamic/static/session rule budgets, priority, per-site exceptions, block/allow/removeparam/redirect coverage and exact reporting of unsupported filter syntax. Chrome and Edge use Chromium's engine but may have version, store or permission differences.
- Replace Firefox persistent background scripts with MV3 service-worker startup and restoration handling; validate worker sleep/wake behavior, list update caching, tabs, storage, site-scoped controls and live popup/report paths. Browser-specific Gecko permissions, DNS, proxy, notification settings, response streams and MAIN-world helpers require explicit feature gates or alternatives. In particular, **response filtering and real-time network decision logs cannot be assumed to work identically in Chromium**.
- Generate platform-specific manifests and archives from the same source, without installing external filter engines for users. Run local cross-browser tests and then real Firefox/Chrome/Edge testing (including sign-in/payment, streaming and sites that change ad delivery).
- Respect each browser's developer-account signing, listing and approval policy; keep release/installer/manual promotion owner-controlled.

## Explicit invariants
No GitHub Actions, no additional branches, no automatic browser opens, no new telemetry/acceptable-ads, no unauthorized layout changes and no claim of full cross-browser support until each required browser behavior has been tested. Protect existing user-verified Firefox playback and legitimate Google-based sign-in.
