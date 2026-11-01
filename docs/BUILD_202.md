# Build 202: YouTube filtering and playback compatibility

**Unreleased:** 0.3.172, November 1, 2026.

Major integrated YouTube filtering package: the passive observe-only mode no longer exempts first-party JSON calls from native/Ghostery network rules; response-only requires an available Firefox response hook and bridge-only still reaches the MAIN-world filter. The local ad recognizer now hides six explicitly identified YouTube desktop/mobile ad renderer elements while protecting normal video tiles, media players, and existing user exceptions. The ad observer inspects at most 12 insertion nodes without invoking potentially hostile NodeList iterators. Includes real background request-mode integration and DOM safety/performance regression fixtures.

The mode-arbitration bug is fixed at the actual blocking decision point. Changes are site-scoped, reversible and don't touch streaming media bytes or signed playback requests. No additional permissions, remote executable code, browser launches, GitHub Actions, downloadable builds or public release. Standalone syntax and focused arbitration/ad-marker checks were performed; the full seven-phase Ubuntu suite and real Firefox ad-free acceptance remain outstanding.
