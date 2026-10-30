# Adblock Plus 4.49.0 vs DK Live Block: Firefox feature inventory

**Snapshot: 30 October 2026.** Based on user-provided screenshots of ABP's **General** and **Advanced** pages, supplemented by its published feature descriptions. Scope is the desktop Firefox extension. Source implementation is **not** equivalent to live Firefox verification.

Status legend: **Implemented** = source pathway exists; **Partial** = limited implementation; **Missing** = not yet built; **Different by design** = deliberately excluded.

| Visible ABP feature | DK Live Block status | Acceptance / remaining work |
| --- | --- | --- |
| Blocking standard display ads | Implemented (filter engine, EasyList, fallback patterns) | Measure actual ad removal and false positives |
| Blocking additional trackers | Implemented (EasyPrivacy default on) | Test cross-site trackers and list freshness |
| Basic distraction control | Partial (conservative overlay classifier) | Verify corner videos, install/shop prompts and legitimate UI |
| Block push notification permission requests | Missing for native Firefox permission prompts; some webpage prompts affected by lists | Investigate Firefox permissions APIs and safe per-site choices |
| Block social media icons/tracking | Implemented as social filter subscription | Test widgets and related request blocking |
| Premium: cookie-consent popups | Partial (reject-only helper and filter subscription) | Validate against real consent platforms; no accidental acceptance |
| Premium: enhanced distractions | Partial (newsletter, survey and floating-corner overlays) | Floating video without interrupting actively playing content |
| Acceptable Ads enabled by default in ABP | **Different by design: none. No paid whitelist or automatic ad exception** | Check all rule paths and future updates |
| Only allow Acceptable Ads without third-party tracking | **Different by design: no Acceptable Ads feature** | Not applicable |
| Language filter: select default language | Missing verified regional-list catalog | Curate list licenses, languages, URLs, release versions |
| Language filter: add/remove additional languages | Missing dedicated selection UI | Preserve explicit opt-in and performance notices |
| Notify about new language filter lists | Missing | Opt-in local announcement only |
| Advanced: badge number blocked | Implemented; Build 45 adds a user preference | Test per-tab updates and reset behavior in Firefox |
| Advanced: right-click Block Element | Implemented in Build 45 (uses existing picker) | Test context menu on pages, iframe targets, restricted Firefox pages |
| Advanced: Adblock Plus panel in Developer Tools | Implemented in Build 45 (optional Firefox DevTools panel) | Test panel registration, start/stop, hostname-only records |
| Advanced: debug element-hiding filters | Missing dedicated non-destructive debug highlighting | Highlight matching selectors, disable/revert without changing page |
| **Advanced: allow occasional promotional messages (checked in user's screenshot)** | **Different by design: never implemented. No developer ads or upgrade nags, no opt-in toggle needed** | Keep own advertising/promotional surfaces absent |
| Filter list status toggles | Implemented for bundled EasyList, EasyPrivacy, Cookie, Annoyances and Social | Firefox state management and failures |
| Filter list last updated and errors | Implemented in Settings status summary | Individual list rows, error details, stale status and refresh |
| Update all lists | Implemented: update enabled lists | Interrupt/resume tests and offline fallback |
| Add built-in filter list | Partial: five built-in lists have checkboxes, no wider curated catalog | Add verified eligible official lists |
| Add list by URL | Implemented: up to five HTTPS custom subscriptions | Verification, errors, duplicate handling, scope and size checks |
| Per-list gear/configuration and remove | Build 47: individual built-in controls plus custom list status, Refresh and Remove | Full Firefox regression, automatic retry and detailed list editor |
| Custom filter editor and add filter | Implemented: text custom rule editor + element picker | Syntax validation, per-rule diagnosis, undo and safe preview |
| Allowed/paused websites | Build 46: explicit one-click website allowlisting, remembered hostname list, individual removal; separate scoped request exceptions | Live Firefox save/restart/subdomain/cross-tab acceptance |
| General Settings / Advanced / Help navigation | Implemented as settings sections, not identical UI | Usability testing, keyboard access and searchable settings |
| Premium login / upgrade banner | **Different by design: no login or payment tier** | No paywalled protections or promotional reminders |
| Show toolbar count and network activity | Implemented: badge, monitor and access inspector | Browser-side counting accuracy and display cleanup |

## Required release tests

1. Default installation: protection on; cookie, tracking and annoyance lists active if available; **no Acceptable Ads, sponsored allowances, promotional nags, upgrade banners, required login or paid tier**.
2. Check every user-visible setting, explicit opt-outs and restoration after restart. No hidden protections enabled solely by payment.
3. Test each of five subscription lists, update freshness, custom URL failures, custom rules and language-list discovery.
4. Test popup traps, network monitoring, per-site rule exceptions, right-click picker, Developer Tools panel and developer debug mode once built.
5. Test cookie-consent rejection and common overlay types across unrelated real websites, ensuring accessibility and sign-in/payment/media continue working.
6. Test YouTube preroll/midroll and Disney+ playback on real Firefox sessions; do not claim parity with ABP without evidence.
7. Record sanitized, reproducible results and file issues before any public AMO release.

**Open work**: Native Firefox notification prompts, curated language subscriptions, individual list management, non-destructive cosmetic debug overlay and real-browser acceptance. This is a roadmap inventory, not a claim of parity.

## Reference URLs

- https://adblockplus.org/features
- https://adblockplus.org/premium
- https://help.adblockplus.org/adblock-plus-help-center/all-about-adblock-plus-premium
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus
