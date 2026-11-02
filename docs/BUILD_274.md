# Build 274 / v0.3.244: Agent Nesty 5

Agent Nesty 5 is the next numbered specialist after Agent Nesty 4. It targets the original-tab takeover in which a site opens the desired XNXX video in a new tab and redirects the original tab to an advertiser.

The agent requires a Firefox-observed source/child relationship and an actual XNXX /video page in that child, then accepts only a foreign main-frame GET within 4.5 seconds. No ad-domain list or full browsing URLs are stored in evidence. Authentication popup destinations are exempt. Existing Stripchat-specific fallback remains unchanged. Agent Nesty 4 now also recovers source-tab attribution if the cached host was unavailable when the tab opened. Unit and background regressions cover positive and negative cases.

Scope and limits: source-only changes to the existing Firefox blocker; no UI geometry, YouTube/Disney+ filtering or permissions changed. Full Linux suite and real Firefox XNXX playback/popup acceptance are still outstanding. Short timing cannot prove human intent; very fast deliberate offsite navigation after opening a genuine new video is a possible false positive.
