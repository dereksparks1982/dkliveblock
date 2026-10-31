# Build 89: bound concurrent YouTube response buffering

Unreleased 0.3.59. A single intercepted JSON body uses up to 1.5 MB; the former implementation had no global concurrency limit. We now admit at most sixteen active Firefox response filters in total and at most four per tab. If limits are reached, do not attach a filter: Firefox receives the original response, uninterrupted, with a bounded skippedBusy count available on the Site Dashboard and local TXT/JSON YouTube report. Every closing, disconnect and timeout path releases its slot once. The existing timeout and source-origin gates remain active.

Tests exercise both per-tab and global caps, release/reuse and non-allocation on skipped requests. Full local test execution and live Firefox acceptance are still required. No user terminal commands, GitHub Actions, external runtime setup or release.
