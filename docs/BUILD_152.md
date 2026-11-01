# Build 152: nested YouTube playback refusal integrity

**Unreleased version 0.3.122 (2026-10-31).**

The existing Firefox player-response handler correctly preserved top-level refusal statuses, but a playable-looking outer envelope could still lose its ad metadata when a nested playerResponse (object or stringified JSON) explicitly refused playback. That partial edit did not remove the refusal and could confuse compatibility troubleshooting.

Both src/youtube-response.js and the Firefox MAIN-world src/youtube-page-bridge.js now inspect nested refusal status and structured errors before touching any ad-only fields. Explicitly denied, malformed, oversized, and unknown nested content is left intact rather than partially altered. Normal valid inner and outer advertising metadata are still pruned under the existing opt-in site setting and bounded endpoint restrictions. No video bytes, identity data, DRM, permissions, UI or remote scripts changed.

Tests cover inner object/string refusals, structured errors, malformed/unknown children and normal JSON fixture behavior. This is defensive playback-integrity work, NOT evidence that YouTube anti-adblock enforcement is bypassed or that preroll/midroll movies play ad-free. Full Ubuntu regression and real Firefox acceptance remain required.
