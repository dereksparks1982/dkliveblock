# Build 260 · v0.3.230: Facebook test-readiness repairs

## Confirmed code defects addressed
1. **Obfuscated Sponsored labels skipped before decoding:** the main feed-byline loop rejected any element with more than two children, contradicting the existing multi-character span label decoder. The loop now allows bounded, explicitly recognized split-letter labels to reach the decoder and preserves rejection of unrelated large wrappers.
2. **Right-rail advertising links never ascended to the real card:** `rightRailLinkCard` was repeatedly checking only the link's immediate parent because `node=p` was missing inside its ancestor loop. It now climbs to the safely bounded complete sidebar card, stopping at protected headings such as Contacts, the body, navigation, oversized containers and other root boundaries.
3. **Unnecessary global cosmetic gate:** a generic-hide policy exception formerly switched off the Facebook-specific detector along with generic cosmetics. A `$generichide` exception now leaves the *explicitly site-scoped* Facebook recognizer on. A whole-page document exception, `$elemhide`, disabled extension, site allowlist, temporary pause, and user ad-recognition opt-out still disable it.
4. **Referenced byline evidence:** reference decoding now accepts the same author-header proximity check as direct labels, without accepting body text.

## Diagnostics for the next real-world test
- Added **Facebook detector diagnostics (local, counts only)** inside a collapsed section of the existing Meta Intelligence viewer. Use the already-existing Site Dashboard → Meta advertising intelligence link while a Facebook tab is selected.
- **Check Facebook scanner** requests a read-only report from that tab's top-level DK content script. Counters include scans, most recent scan timestamp, hidden containers, recognized rail/menu/byline signals and unresolved container counts, plus whether the protection was active and the Facebook adapter loaded.
- **Export safe diagnostics** saves only these bounded aggregate counters and status booleans to local JSON. No post text, profile names/IDs, browsing URLs, cookies, DOM, network headers or credentials are captured.
- Read-only diagnostic UI is a collapsed addition; no approved geometry or working controls moved.

## Verification performed
- JavaScript source compilation check performed after code edits.
- Isolated simulated DOM scan: a nine-span `Sponsored` feed label and two-span `Ad` feed label both hid exactly one valid card, while an organic feed label did not hide its card.
- Isolated simulated DOM rail: a `target=rhcad2` link nested inside small, medium and whole-ad wrappers resolved to the whole bounded sidebar ad, not the small inner parent.
- Added `tests/facebook-build260.test.js` regression fixtures to preserve these cases and the diagnostic wiring.
- The connected GitHub tool environment does not execute a full Firefox browsing session or the entire repository Node suite. **Actual Facebook performance and correct handling of user content remain owner acceptance tests, not proved successes.**

## Next acceptance focus
1. In Firefox, check the old screenshot cases: a clearly marked feed **Ad** post, plus right-rail **Sponsored** units.
2. Check ordinary posts, right-rail Contacts/Birthdays and Messenger, then scroll and let Facebook load new content.
3. If any advertising remains, open Site Dashboard → Meta advertising intelligence → Facebook detector diagnostics, click **Check Facebook scanner**, then **Export safe diagnostics**. This distinguishes disabled/missing scanner from unmatched label and unsafe container rejection. Do not require raw page DOM, session cookie values or private content.
4. Do not transplant uBlock's GPL-scriptlet engine wholesale or activate the parallel MIT standalone extension, since this has separate rights/integration boundaries and regression risks.

**Status:** Ready for a focused owner test, *not* verified Facebook PASS. Other Meta sites and first-party GraphQL ad data filtering remain future work.
