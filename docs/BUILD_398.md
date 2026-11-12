# Build 398 / v0.3.358: Facebook mutation scanning fairness and coalescing

**November 12, 2026. Internal main-branch development only.**

Facebook can add a wrapper, its labelled header and its nested controls in one synchronous React render. The original scanner de-duplicated queued elements by identity but still scanned every overlapping subtree independently. This wastes frame time and can delay hiding late sponsored posts while a feed is busy.

This build coalesces pending descendant scans into the ancestor scan when both were scheduled before paint. Separate cards remain separately queued. Scanning processes at most 48 connected roots in a requestAnimationFrame callback, retaining the remaining ones for subsequent frames. At 96 queued roots, fallback becomes a single existing document-body scan to preserve coverage instead of forgetting candidates. Pending work is cleared when the full Facebook engine is paused.

The complete MIT Facebook detector, exact label rules, 50 ms staging retry, implicit ad inference protections, saved user exceptions, tracked hidden-post lifecycle, popup/YouTube subsystems and user UI remain unchanged. Synthetic scheduled-frame fixtures cover nested scans, detachment, fairness and overflow. The full native Ubuntu suite and live Firefox scrolling outcomes have **not** been executed here. This is not proof of hiding every Facebook ad.
