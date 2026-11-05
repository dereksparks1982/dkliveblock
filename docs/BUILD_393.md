# Build 393 / v0.3.353: Ghostery request-type adaptation

**November 4, 2026. Internal, main-only.**

Firefox WebRequest emits specialized `imageset` (responsive image) and `beacon` (Beacon API) types. DK's native rule parser already maps those to `image`/`ping`, but the bundled Ghostery adapter previously sent raw Firefox-specific names. This could prevent Ghostery-only rules from matching those requests.

This build adds a two-value adapter at the existing MPL-2.0 Ghostery Request.fromRawDetails boundary. No new filter engine, build dependency or GPL source is incorporated. Unknown types are forwarded unchanged. User manual exceptions, native `$important`, site pause and player safeguards keep their prior precedence.

Synthetic tests cover vendor-only matches, user exceptions, generic block and popup exclusion, unrecognized types and method forwarding. The bundle is unmodified; Firefox and complete Ubuntu acceptance remain pending. No release authorized.
