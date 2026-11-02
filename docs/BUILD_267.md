# Build 267 / v0.3.237: event-batch integrity and Orion foreground safety

## Verified source change
Orion's previous observer returned early after the first relevant mutation, dropping remaining changes from that single batch. Facebook's React DOM can introduce and discard ad labels within one update, so the adapter now always forwards all 40 bounded mutations to DKFacebookAds.observeMutation, then queues at most one scan. The existing Firefox content observer also processes all 40 records instead of exiting when both popup/ad relevance were found.

Orion maintains an epoch counter across pagehide/pageshow and ignores callbacks created in earlier generations. Pagehide restores changes and shuts down interval/observer; visibility return schedules a scan only if active and visible. No new browser APIs, permission, tracking, content capture, CSS layout changes or network blocking.

## Reproduction and acceptance
- 11 simulated JS VM cases passed in the development connector evaluator, including 40-element bursts, 10,000-element truncation, late disappeared labels, page cache, hidden state, and source contract checks.
- Full Ubuntu tests and true Facebook/Orion iPhone acceptance still pending. Meta GraphQL filter stays OFF by default.
