# DK Live Block Build 238 · 0.3.208

**Owner directive:** Fix Facebook automatically leaving sponsored feed posts visible even when DK Live Block's Ad Investigator identifies explicit sponsored-content menu evidence.

## Root cause addressed
The investigator's existing `candidateFor(target)` and `factsFor(card)` found a sponsored-content action menu in the full post (owner screenshot, synthetic evidence score 0.90). The separate automatic scan often began with `role=article` / FeedUnit containers or narrow exact CSS suffix labels, so valid labels with trailing whitespace or unmarked React feed cards could fail to reach the hide path. This build joins the two determinations, **without relying on the AI model score to block anything**.

## Changes
1. Facebook-only `sponsoredFeedCard(menu,doc,win)` uses the investigator's bounded card-selection and explicit sponsored-menu fact; requires a contained menu, safe post dimensions, no protected page/dialog/nav/feed roots and no protected model context.
2. Automatic scan checks normalizable sponsor-menu accessibility labels directly (bounded, rotating cap) rather than requiring an exact CSS suffix or article wrapper. On match, it hides the entire safe card, not only the word Sponsored.
3. An owner exception on the ad label or whole post wins; post hides track their triggering menu so changing the exception restores the post. Existing reversible inline-style handling remains in place.
4. The Build 237 draggable investigator, manual block-element picker, site controls and previously working video/pop-up paths are preserved. No new permissions, telemetry, remote code, external engine, GitHub Actions or new branches.

## Verification
- Fifteen targeted existing/new Facebook test cases passed in isolated JavaScript from the current GitHub source and proposed code. The new fixture reproduces the screenshot's supported condition: a sponsor-content menu detected by the investigator on a bounded post but no conventional role=article marker and a label that exact suffix CSS misses.
- Organic mentions, non-sponsored menu labels, protected dialogs, site exceptions, restoration and bounded long-feed rotation are included in tests.
- Full Linux seven-phase suite, live Facebook behavior and right-rail automatic acceptance remain **unverified**. The owner must update the existing extension and retest. No public release or competitor parity claim.
