# Build 43: Disney+ player compatibility and source-scoped repair

**Version 0.3.14 · UNRELEASED source · 30 October 2026**

## Implemented

1. Extend the already bounded, local-only HTML5 health probe from YouTube to exact Disney+ hostnames, rejecting lookalikes. Probe does not read player title, watch progress, authentication tokens, DRM keys, network payloads or stream URLs.
2. Reuse the current 1.25-second passive check only when logging and protection are enabled; never add a new polling loop. A hidden/paused/seeking/ended player does not produce buffering events, while a visible paused-after-failure player can still report a generic HTML5 error.
3. The Settings health panel, blocked-request diagnostics and repair list discover the active/recent **streaming** tab rather than a random recently accessed webpage.
4. Blocked streaming request groups carry the source page hostname, are bounded/time-limited and cannot be used as evidence after switching between streaming services.
5. Individual user-approved 10-minute streaming host/type allowances can be revoked separately or all at once. Background reads the tab's real current URL before granting and matches the observed source, destination hostname and resource type.
6. New unit and background regression checks cover Disney+ domain lookalikes, coarse media-error privacy, cross-site diagnostics, individual revocation and unchanged ad filtering.

## Honest limits and pending acceptance

- Detecting video buffering/error **is not equivalent to blocking ads**, proving a filter caused an error, fixing a DRM/CDM issue or supporting all Disney+ player implementations.
- Disney+ may hide players behind different DOM structures and DRM-related browser behavior; this extension does not modify media streams or DRM.
- No public claim of Disney+ reliability or Adblock Plus feature parity until actual Firefox logged-in playback and non-skippable/server-inserted advertisements are separately tested.
- Full offline Node/Python regression suite, full Firefox browser integration and independent review remain pending. No GitHub Actions, dependencies, downloaded release packages or publication.

See [ABP parity checklist](ABP_PARITY_CHECKLIST.md) and [support reporting](../SUPPORT.md).
