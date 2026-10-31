# DK Live Block Build 64: YouTube playback enforcement visibility

Unreleased development v0.3.34. October 30, 2026 local (October 31 UTC).

Input: actual Firefox YouTube blocked-request export from the user. Five recorded blocks: three expected DoubleClick advertising requests, one Google image blocked by embedded Ghostery, one first-party YouTube image blocked by an unrevealed native rule. Zero media network blocks were listed. Neither image's role can be determined from hostname-only evidence.

Investigation found the anti-adblock content script hid YouTube's explicit playback-refusal notice without verifying the player was usable. It could leave a black frame and falsely imply success. Build 64 retains a visible explicit YouTube playback-refusal notice and records a bounded coarse enforcement event in the existing privacy-enabled playback-health system.

Added a playback diagnostic section on Site Dashboard and included these events in local TXT/JSON exports. Playback enforcement, buffering and media errors are distinct. No text, raw media URLs, cookies, video titles or credentials are captured. Corrected generic image-importance assessments on google.com and youtube.com: these may be essential or optional.

No silent allowlisting, global filter disabling, stream URL substitution, login workaround or speculative CDN exemption. No GitHub Actions, packages, or released artifacts. JavaScript source syntax checked; complete local suite and live Firefox checks pending. This build does NOT solve YouTube ad-free playback, but makes the actual refusal visible and traceable.

Next: after reload, inspect YouTube playback diagnostics alongside the blocked-request export, then isolate the exact image filter or other player/extension conflict without sacrificing all ad blocking.
