# Build 195: repair streaming permission syntax and track YouTube player replacement

**Unreleased:** 0.3.165, 2026-11-01.

Corrected a Build 194 revoke() syntax error and test alias, and made YouTube's ad-state probe reset its observed-player identity when SPA navigation replaces the video element, retaining the eight-second deduplication cooldown.

Local V8 source syntax was checked for both production modules and their test files, but the full Ubuntu Node/Python suite and live Firefox playback were not run. No public release or GitHub Actions.
