# Build 21: YouTube and streaming reliability (0.2.2, unreleased)

The YouTube Skip Ad assistant now watches relevant player DOM changes and scans shortly after preroll/midroll controls appear, instead of relying solely on the existing 1.25-second fallback check. It debounces rapid mutations, limits candidate inspection, and disconnects immediately when protection or the YouTube assistant is paused. It also runs in YouTube-nocookie embeds.

Safety improvements: recycled ad-skip classes cannot click obviously unrelated Skip Intro / Recap / Credits / Next controls. Streaming-site procedural element hiding refuses player or active-media wrappers. Disney+ does not run the YouTube watcher; its media is not modified, accelerated, muted or rewritten. Optional site-only Playback Rescue remains off by default.

Scope: the six new observer-focused Node tests passed in an isolated test run. The added content-script and manifest tests still need to be exercised by the full offline suite on the complete repository. Real Firefox YouTube preroll/midroll efficacy, Disney+ normal playback and DRM compatibility remain unverified. No release or ABP parity claim.

## Mandatory Firefox acceptance checks
1. With DK Live Block alone enabled in Firefox on Ubuntu, test signed-out and signed-in YouTube: several videos with preroll and midroll breaks, a playlist, captions and next-video navigation.
2. Verify legitimate Skip Intro, player seek/play/pause, fullscreen and captions remain functional; note missed ads and black-screen/stuck-player conditions.
3. Test YouTube-nocookie embeds and reloaded/single-page navigation.
4. Test Disney+ title load, trailers, seeking, next episode, and playback without/with site-specific Playback Rescue; check for DRM and player failures.
5. Re-run the complete offline tests and do not ship until required acceptance evidence is captured.

No hosted CI, additional user dependency, or new permissions.
