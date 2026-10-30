# DK Live Block: Adblock Plus desktop Firefox capability and acceptance checklist

**Status: internal comparison, not a claim of parity. Checked 30 October 2026.**

The reference is the official Adblock Plus free feature overview and official Premium help pages:
- https://adblockplus.org/features
- https://adblockplus.org/premium
- https://help.adblockplus.org/adblock-plus-help-center/all-about-adblock-plus-premium
- https://help.adblockplus.org/adblock-plus-help-center/block-cookie-consent-pop-ups-with-adblock-plus-premium
- https://help.adblockplus.org/adblock-plus-help-center/block-more-distractions-with-adblock-plus-premium

The iOS-only Premium feature *ad blocking in apps* is **not** a capability of the ABP Firefox desktop extension, so it is out of scope for Firefox parity. A product description is **not test evidence**.

| Firefox capability | DK Live Block source status | Release acceptance still required |
| --- | --- | --- |
| Common ad/tracker blocking with filter lists | Implemented: local rules, EasyList/EasyPrivacy, hybrid engine integration | Real-world coverage, filter syntax, false positives and benchmark comparisons |
| Manual element hiding and per-site controls | Implemented: element picker, exceptions, per-tab controls | Save/restore/undo, dynamic pages, shadow DOM and legitimate page controls |
| Popups, popunders and redirect defenses | Implemented: strict source-site trap and rule-based popup handling | Real Firefox race conditions, openerless tabs and login popup safeguards |
| Automatic ad detection | Partial: high-confidence DOM ad slots | Observe unknown advertisers; inspect false positives on articles and players |
| YouTube ads, streaming video | Partial: ad-specific cosmetic pack, cautious Skip Ad assistant and diagnostics | Preroll, midroll, shorts, mobile, non-skippable and server-inserted ads tested on Firefox |
| Disney+ streaming compatibility | Partial: host-scoped blocked request diagnostics, HTML5 health probe and manual repair | Live logged-in playback, legitimate content, DRM behavior, ad-tier tests if available |
| Premium-equivalent cookie-consent handling | Partial: optional multilingual cookie rejector, optional list | On-site rejection vs accidental acceptance, pop-up display, regional/localized forms |
| Premium-equivalent distraction control | Partial: popups, overlays, annoyance lists | Floating video, newsletter prompts, survey requests, site notifications, navigation safety |
| Social widgets, tracking and filter customizations | Source support exists | Functional browser tests, custom subscriptions, performance and privacy review |
| No Acceptable Ads exemption | Intentional DK policy: no paid allowlisting | Confirm no bundled paid exception and all rules remain user-controllable |
| Release and support | Official Proton support email and in-extension reporter in place | Signed Firefox Add-ons review, privacy disclosure and post-release triage |

## Mandatory manual acceptance matrix

- **Firefox/Linux:** Verify that DK Live Block itself installs and runs under supported Firefox versions. For streaming providers, independently establish service/browser eligibility; do not assert Linux playback support where a provider does not explicitly guarantee it.
- **YouTube:** Observe a full ordinary video, a preroll, midroll, a non-skippable ad, signed-in and signed-out cases. Track whether an ad actually displayed and whether real content kept playing. Skip controls must not act on normal navigation/buttons.
- **Disney+:** Only with an authorized account/service tier, observe startup, long playback, seeking, subtitles, full-screen and an error/retry. Do not assume the HTML5 `video` element is exposed or that playback errors identify ad blockers. If an ad-supported tier is tested, record its advertising separately from buffering/DRM behavior.
- **Ad, tracking and privacy:** Compare the same sites/profiles against ABP Free, Premium where available, and a clean baseline. Record blocked/allowed traffic, rendered advertisements, page functionality and performance. Tests need explicit consent and sanitized logs; retain no private URLs or keys.
- **Exceptions:** Grant an exact host/resource type for ten minutes, verify that unrelated hosts/types remain blocked, revoke one, revoke all, expire and switch sites. Never turn a diagnostic signal into an automatic allow rule.
- **Report outcomes:** Store reproducible pass/fail evidence in the repository's manual QA tracker, not in the user's personal browsing history. Any regression or gap blocks a public parity claim.

**Release gate:** all mandatory cases pass with versioned evidence and documented issues addressed. This checklist is a plan, not completed test evidence.
