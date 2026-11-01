# Build 156: YouTube ad-skip watcher performance

**Unreleased 0.3.126, October 31, 2026**

The content script's mutation watcher previously interpreted any mutation under the broad YouTube player ancestor as an ad-skip event. Playback progress, caption and control style changes could therefore trigger repeated candidate scans even when no ad existed.

The watcher now responds to dedicated skip buttons/containers, actual ad modules, player-root state changes and bounded added-node matches, not a generic ancestor match for every descendant. Attribute mutations do not recursively scan arbitrary subtrees. Unknown attribute types are ignored. Keep the existing 40-record and 12-added-node bounds, debounce and pause/disable behavior. Three focused fixtures exercise progress events, real ad events and unrelated insertions.

No permissions, external dependencies, player/video byte modifications, remotely loaded code, UI changes, automated CI or release. Full Ubuntu regression and real YouTube/Disney+ testing remain unverified.
