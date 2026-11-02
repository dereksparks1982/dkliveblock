# DK Live Block: Unified Browser Architecture

Single source: `src/`. The shared Nesty coordinator `src/nesty-intelligence.js` is a **review-only library** and should never depend on `browser.webRequest`, `declarativeNetRequest`, page cookies, or a specific UI. It consumes only compact categoric signals and evidence from existing site filters.

- **Firefox / Gecko:** existing Manifest V2 blocking webRequest, native engine, request monitor and content scripts. This remains the only fully implemented extension network backend.
- **Orion iOS/macOS:** experimental DOM-only packaging. Uses the same Nesty source files and existing ad-recognition code, but not Firefox's privileged filtering APIs. Features not provided by Orion APIs are not activated. No feature parity claim.
- **Yandex desktop / Yandex Android:** proposed Chromium Manifest V3 packages with a declarative network backend *if* supported and verified in that platform. Identification alone is not enough. No installable target is produced by this build.

The builder may exclude incompatible browser-specific modules even though they live in the shared repository. Otherwise unused code stays inert. One logical engine and common specialist roster, with separate adapters and manifests where the target requires them.

Company recognition is independent of advertiser identity. Meta includes Facebook, Instagram, Threads and WhatsApp with distinct platform modes. YouTube uses existing video engines. Reddit currently contributes an observation-only profile. The system never applies Facebook DOM hiding to Instagram or WhatsApp.

Evidence flow: local site/context signal -> normalized bounded tokens -> matching company/platform -> related Nesty specialist -> delivery catalog hypothesis and synthetic score (if applicable) -> **review only**. Production filters and DOM-hiding decisions remain controlled by the existing vetted modules. Opt-in network observation records only destination hostnames, types and aggregate counts, never complete URLs, request contents, session tokens or posts.

Future gate: successful full offline Linux regression, browser-specific packaging checks, owner verification for false positives, memory/performance, site login/playback, and documented acceptance before expanding supported browsers.
