# Build 85: never hold player JSON streams indefinitely

Unreleased v0.3.55. Firefox requires an extension that intercepts response bodies to close or disconnect the stream. DK Live Block now limits buffering to four seconds and 1.5 MB; a deadline flushes bytes unchanged and disconnects, allowing Firefox to deliver remaining data. Oversized content also flushes and disconnects immediately. Unknown and malformed JSON remains pass-through. The local YouTube dashboard and explicit report count deadlines, but those counts are not proof of ad-free playback. Deterministic timer and size tests are included in the local runner.

No GitHub Actions, installs, public release or terminal instruction. Real Firefox and full offline-suite acceptance still outstanding.
