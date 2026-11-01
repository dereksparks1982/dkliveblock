# Build 158: local YouTube Skip Ad click evidence

**Unreleased version 0.3.128 (2026-10-31)**

The YouTube skip assistant can click a visible Skip Ad button, but earlier playback diagnostics could not distinguish that action from network filtering or a playback refusal. The content script now sends one coarse "ad-skip" event, only when the controller actually returned clicked=true and existing local playback diagnostics are enabled.

The background accepts this event only from the verified current top-level YouTube tab with opt-in request logging enabled. Site lookalikes, Disney+ and subframes cannot record this kind. Local history retains existing rate limiting, expiration, bounded size and user controls. No video ID, title, URL, account information or original player content is included.

This event appears in the existing playback diagnostic area and optional YouTube TXT/JSON report with clear **button clicked, not proof of ad removal** wording. New tests cover privacy, authorization, host restriction, rate limiting and report interpretation. No new permissions, dependencies, remote code, GitHub Actions, downloads or UI geometry changes.

The full Ubuntu test suite and real Firefox playback/ad-free acceptance have not been completed. This is an unreleased source build.
