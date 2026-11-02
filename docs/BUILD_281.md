# Build 281: Shared Nesty intelligence integration (2026-11-02)

## Scope
Consolidate existing local company-routing, specialists, delivery evidence,
provider observations, and offline synthetic assessment into ONE read-only
coordinator at `src/nesty-intelligence.js`. Preserve the working Firefox
blocking engine, Meta Sponsored DOM detection, privacy settings, and browser
network APIs. No auto-trained defenses, no remote AI, no automatic rule updates.

## Integrated paths
- Firefox background and content: load the same coordinator source before its
  consumers, with the existing Meta scanner remaining the only Meta DOM blocker.
- Background: optional diagnostic provider host/count observations are routed
  through the coordinator, separated by company platform. Existing Meta
  observations/UI remain backward compatible. An extension-only, tab-bound
  `getNestyIntelligence` read is added for future UI work.
- Meta: a bounded `inspectSignals` read-only interface; Instagram, Threads,
  and WhatsApp remain observation-only, never Facebook DOM blocking by accident.
- YouTube: existing YouTube engines remain authoritative. The shared interface
  may review bounded media evidence but never changes playback.
- Reddit: company profile is observation-only. No untested Reddit blocker added.
- Orion experimental: candidate packager reuses the same core Nesty sources;
  Orion stays DOM-only/unverified, with no Firefox network-permission promise.
- Yandex desktop/Android: identified as adapter-required Chromium targets;
  nothing here claims a working package or network blocking on Yandex.
- Website: Russian tab favicon uses existing Russian emblem, English tab
  favicon uses existing cyan site icon. Existing approved banner/layout preserved.

## Safety
Evidence is made from short allowlisted tokens, not page text, credentials,
cookies, request payloads, or full URLs. Unknown relationships stay unknown.
Signal combinations yield review/observe, never hide/allow/block or install a
filter. No new network calls or telemetry. Logs remain optional, with
observations cleared when request logging is disabled. Site exceptions and
GraphQL-off default remain authoritative. Existing Meta provider read/clear
actions remain supported.

## Validation evidence and limits
- Focused source checks: shared coordinator smoke cases tested for routing,
  weak versus corroborated signals, platform isolation, provider hostname
  validation, no logging opt-in leakage, and clear behavior.
- JavaScript syntax checked for staged runtime changes; manifest JSON parsed.
- Added `tests/nesty-integration-build281.test.js` with assertions for the
  integration and language-specific favicon.
- Full local `npm test` or `scripts/test-local.sh` **not run** in the tool
  environment; no access to the user's Firefox/Yandex/Orion sessions.
- Therefore browser acceptance, performance, regressions, and any live
  blocking outcome are **unverified**. Build 281 is engineering integration,
  not a release or declaration that the entire AI roadmap is finished.

## Next release gates
Run the full local test suite, Firefox owner smoke tests on known working
sites, and normal-content false-positive tests; then validate Orion separately
and implement/test a real Chromium MV3 network adapter before Yandex claims.
No new features until the shared integration's baseline is proven.
