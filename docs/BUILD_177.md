# Build 177: first-party JSON parser interception informed by uBlock Origin

**Unreleased version:** 0.3.147 (2026-10-31).

## Actual competitor source inspected

- **uBlock Origin**, `gorhill/uBlock/src/js/scriptlet-filtering-core.js`: maintains hostname-scoped scriptlet rules with explicit exceptions; it does not inject every scriptlet into every page.
- **uBlock Origin**, `gorhill/uBlock/src/js/resources/json-prune.js`: uses a scriptlet interception of `JSON.parse` and removes selected fields from parsed objects when conditions match.
- **uBlock Origin**, `gorhill/uBlock/src/js/resources/set-constant.js`: illustrates more general object/property interception, which DK deliberately does **not** duplicate in this build.
- **uBlock Origin**, `gorhill/uBlock/src/js/static-net-filtering.js` and `src/js/traffic.js`: native rule matching is handled separately from site-scoped scriptlets and response-body handling.
- AdGuard Browser Extension and Adblock Plus Core public GitHub metadata inspected as architecture comparators. Their full source was **not** audited in this build.

These are GPL-3.0 sources. Their code was reviewed for behavior and architecture only. **No GPL source code was copied into DK Live Block.** DK continues using its independently written bridge and bundled Ghostery licensing.

## Concrete gap fixed in DK

The old DK YouTube main-world bridge could prune known `adPlacements`, `adSlots` and `playerAds` fields from recognized player API responses and bootstrap objects. It did not intercept **direct `JSON.parse` calls made by YouTube's page code**. Player JSON consumed through this path could retain ad metadata even when DK's fetch/XHR response decorators were active.

Build 177 adds an independently authored, fixed-purpose scriptlet to the existing `src/youtube-page-bridge.js`:

- Installs a removable wrapper around the YouTube page's `JSON.parse` only when that bridge is enabled by DK's site policy and experiment controls. No rule-list JavaScript execution and no generalized scriptlet injection.
- Lets the original parser (including optional reviver) run first; validates string size and the presence of known ad + player-structure keys, then runs the existing conservative `prune` routine. No media bytes or request URLs are rewritten.
- Preserves playback refusals, streaming media URLs, video details and unrelated JSON data; malformed JSON keeps its native exception behavior.
- Saves an untouched internal parser for DK's existing response-text rewrite logic so native JSON interception cannot incorrectly short-circuit the rewrite.
- Restores `JSON.parse` when the YouTube bridge is disabled or switched to observation mode. If another page script replaced the parser after DK's installation, DK does not overwrite that newer parser on cleanup.
- Continues to honor page/extension activation: paused or allowlisted websites do not enable the scriptlet.

## Verification and limits

Targeted V8 smoke checks ran the **actual modified main-world source** with synthetic player JSON:
- Known player ad fields removed while signed stream URLs and video details remain untouched.
- Unrelated JSON, refused players, JSON revivers and malformed input preserve expected behavior.
- Both existing fetch `response.text()`/`response.json()` and cloned response text still remove the same fields.
- Observation mode and disabled state restore the original parser; third-party parser replacements are not clobbered.
- Expanded five regression tests in `tests/youtube-page-bridge.test.js`.

**These are synthetic, not a verified YouTube victory.** The complete seven-phase Ubuntu suite, live Firefox anti-adblock/preroll/midroll testing, and uBlock feature parity remain outstanding. uBlock's full scriptlet library, advanced dynamic firewall, and many network/cosmetic syntaxes remain beyond DK's current implementation.

**Next Build 178:** audit anti-adblock and player-response mismatch evidence using a controlled normal-video versus ad-supported-movie Firefox run. If the new hook causes refusals, use the existing response-only/bridge-only/observe switchboard to isolate it before expanding the default. No GitHub Actions or public release.
