# Build 31: Streaming playback diagnostics

**Version 0.3.2. UNRELEASED development source.**

The browser background records a bounded 30-minute, 60-group-per-tab summary of blocked `media`, `xmlhttprequest` and `other` requests on supported YouTube and Disney+ tabs, **only when local request logging is enabled**. Records hold hostname, resource type, count and time, with no full request URLs, query parameters, cookies or filter-rule strings. The data is in memory, cleared on navigation, tab close, explicit Clear, statistics reset or disabling request logs.

The Firefox toolbar shows a count and Inspect shortcut. The settings page displays the summaries without automatically changing filtering policy. A blocked request can be a legitimate advertisement or tracker; this is not confirmation of a playback bug. User-controlled existing website exceptions and media rescue remain separate and opt-in.

**Release gates unchanged:** complete offline suite, actual Firefox YouTube ad and Disney+ player checks, browser security/performance tests, ABP feature parity and approval.
