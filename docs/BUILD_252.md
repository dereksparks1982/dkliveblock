# Build 252 · v0.3.222: integrate MIT-sponsored detector without replacing DK

Integrates a focused improvement inspired by the vendored MIT Facebook blocker into DK's own `src/facebook-ads.js`. A Facebook feed post with an explicit `Ad` or `Sponsored` label near its author now has an alternative evidence path when the author is rendered as a link rather than the heading elements required by our older byline detector. This path requires the exact short label, containment within a bounded safe feed card, and a nearby distinct author element. It rejects body paragraphs and labels far below the post header.

This is a targeted change toward the owner's screenshot of a clearly marked `Ad` wildlife post. The original Facebook recognizer, right-rail detector, Meta adapter, exceptions, restores, settings, Ad Investigator, YouTube filtering and all other modules remain authoritative and unchanged unless identified. The full standalone upstream extension stays vendored but **not activated**, avoiding duplicate MutationObservers, conflicting site settings and unwanted suggested/unfollowed-post removal.

Source compiled in a JavaScript parser; new regression fixture added. Neither the full Node suite nor real Firefox were executed. The right-rail screenshot case remains an **unverified acceptance target**; no claims of successful Facebook blocking until the owner sees it.
