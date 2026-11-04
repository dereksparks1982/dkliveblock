# Nesty fallback coordination: Facebook and YouTube

**Candidate builds 380–385. Unreleased.** This file documents existing code behavior, not verified live adblocking success.

## Principle

Keep the strongest established detector as the primary implementation. Retain older, independently verified detection strategies in the extension so that a website's reversion can wake them when **specific evidence** requires it. A dormant strategy performs no routine work and must not turn off network protection or interfere with unrelated sites.

## Facebook Meta Nesty, builds 382 / 384 / 385

Primary engine: `facebook-full-core.js`, loaded at document start.

Dormant alternative: existing `facebook-ads.js`, only instantiated when `meta-strategy-nesty.js` authorizes it. The previous adapter's all-zero `scanInserted` and `scanVisible` forwarding no longer makes the old fast scanner unreachable.

Eligibility requires the full core to be loaded, enabled, initialized, and actively observing. An absent or unauthorized full engine is a **failure**, not authorization for a silent legacy replacement.

Signals:
- Accumulated full-engine unanchored labels or unsafe-width refusals increasing by at least two.
- Alternatively, repeated exact, short Ad/Sponsored disclosures on live Facebook feed elements, never free-form post bodies, dialogs, menus or page chrome.
- Evidence has to persist for at least 1.5 seconds. New full-core hides clear pending activation evidence.
- Active legacy scan window: 30 seconds, followed by a 5-second cooldown. A disabled site/picker or failed full-core readiness immediately disarms and restores its hidden elements.
- A second persistent miss can wake the old scanner again, but it remains dormant during ordinary successful full-core activity.

**One hidden post, one owner.** The fallback ignores cards already marked by the full core as hidden. The fallback marks its own hidden posts with `data-dklb-nesty-legacy-hidden`; the full core ignores cards with that marker until the old scanner restores them. No extra observer was created. The old scanner still requires its existing strict single-card boundary, author/byline, and ad-evidence safety checks.

The user-triggered Facebook diagnostics return bounded aggregate `legacyActive`, `legacyWakeups`, and `legacyHidden` counters. Activation does **not** prove that the scanner removed any ads. No post text, names, URLs, cookies or browsing history enter these reports.

## YouTube Nesty, builds 380 / 381 / 383

- A visible in-player enforcement message must remain in a known error container across at least 800 milliseconds before the first signal.
- A warning that disappears will **not** generate sustained follow-up.
- A continuously visible refusal generates at most one further observation after 22 seconds.
- Two distinct, validated refusal reports at least 20 seconds apart, tied to the same live HTTPS watch-video identifier, may activate the existing ten-minute `player-pass-through` strategy. One transient warning never switches strategies.
- Ad-showing or Skip Ad context vetoes an automatic switch, as there may be playable content.
- A one-hour tab/host retry guard prevents repeated switching. Existing ordinary network ad filters continue to run. The prior player response/bridge rewrite methods remain in the code and return automatically after expiry.
- Never reload a YouTube tab on a warning, remove the enforcement overlay, allowlist the entire website, or claim that a page-side refusal was bypassed.

## Test and release gate

Regression checks added for threshold, debounce, expiry, stale and spoofed watches, ownership restoration, disabled states and privacy. JS syntax and focused behavior were checked in a simulated V8 harness. Native Ubuntu suite and an actual Firefox watch-page A/B test remain outstanding. Do not merge or publish as a working YouTube/Facebook adblocking fix until those checks and user acceptance are complete.
