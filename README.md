![DK Live Block neon banner](assets/images/DK%20Live%20Block%20Neon%20Banner.png)

**English | [Русский](README.ru.md)**

# DK Live Block

**DK Live Block** is a free Firefox-first browser extension from Elderred Softworks that helps block advertising, tracking requests, intrusive popups, unwanted tabs, and distracting page elements.

**Build 375 / v0.3.345 (Page Architect discovery):** Added read-only YouTube region discovery and fail-closed clean-view preview. No page modifications or UI controls are enabled; the existing player and ad-blocking engine remain unchanged. Regression tests cover missing player, unknown markup, and data minimization.

**Build 374 / v0.3.344 (DK Page Architect planning):** Added a safe, testable clean-view planner with mandatory original player, strict region choices and explicit opt-in. The feature is deliberately inactive pending approved UI and live playback validation. See [Page Architect design](docs/PAGE_ARCHITECT.md). YouTube recovery remains unchanged.

**Build 373 / v0.3.343 (SPA video identity):** Checks the live YouTube watch-video ID against the transient content-script refusal event before retrying. Stale events from a previous watch page cannot reload the current video. IDs are never added to saved preferences or diagnostics. Live Firefox verification remains pending.

**Build 372 / v0.3.342 (Private recovery):** Decouples YouTube's one-shot refusal recovery from private request-history logging. Logging off continues to avoid storing playback events; only a bounded live refusal decision can trigger the existing tab-local recovery. Other health diagnostics still require logging. Live Firefox confirmation pending.

**Build 371 / v0.3.341 (Watch-page scope):** Automatic YouTube refusal recovery is now limited to live, verified ordinary `/watch?v=` videos. Search, homepage, Shorts, embedded players, and lookalike origins are excluded; network filtering and other platform behavior are unchanged. No claim of live ad-free playback.

**Build 370 / v0.3.340 (YouTube retry safety):** Hardened enforcement recovery so repeated refusal after the ten-minute compatibility window cannot start another immediate reload. A bounded one-hour tab/host retry guard prevents recurring reloads while leaving the normal filter engine in place. Live Firefox verification remains outstanding.

**Build 369 / v0.3.339 (YouTube refusal recovery):** A detected in-player refusal now triggers one bounded, tab-local retry in player-pass-through mode. It keeps ordinary network filtering active, does not hide YouTube's refusal, and never loops reloading. Live playback success is not yet verified.

**Build 368 / v0.3.338 (YouTube refusal triage):** Explicitly identifies YouTube in-player adblock enforcement as distinct from buffering; the local report recommends a controlled ordinary-video A/B check using the existing player-pass-through isolation setting. This is diagnostic guidance, not a confirmed playback fix.

**Development status:** Active pre-release project. Facebook Sponsored removal and YouTube ordinary-video adblock compatibility still require real Firefox checks; source-integrity tests alone do not establish ad-free playback or uBlock Origin parity. No public release has been approved.

**[Official website and downloads](https://dereksparks1982.github.io/dkliveblock/?lang=en)**. Choose English or Русский using the language selector at the top. The extension has its own language setting.


## What it does

- **Blocks ads and trackers:** Uses bundled native and Ghostery-based filtering with configurable subscriptions, including EasyList and EasyPrivacy. Some advanced filter rules are not yet supported.
- **Cleans up pages:** Cosmetic filtering and an optional page-only element picker can hide ads, overlays, newsletter prompts, and other distractions without permanently modifying the site. An experimental, reversible, off-by-default setting can compact supported Pornhub video-thumbnail grids when blocked ads leave empty gaps.
- **Uses specialist Agent Nesty protections:** Separate, purpose-built checks watch for cookie-setting activity, unwanted navigation and Facebook advertising signals. Not every detection method is active on every site.
- **Stops unwanted popups and redirects:** Detects selected intrusive new-tab and redirect patterns while aiming to preserve legitimate login windows, payments, and ordinary links. Coverage varies by website.
- **Puts you in control:** Pause or allowlist individual sites, configure narrow exceptions, add custom rules, and allow or block eligible site-scoped requests.
- **Explains what it does:** The Site Dashboard and Network Monitor show blocked and permitted traffic, available matching-rule evidence, and optional local TXT/JSON reports.
- **Helps with video playback:** Includes optional video and streaming diagnostics and bounded protections for YouTube and other services. Not every type of video advertising can be blocked safely.
- **Provides optional extras:** Cookie notice rejection, distraction cleanup, saved video lists, and experimental Linux companion integrations.

## How to use it

Click the extension icon in Firefox to inspect your current tab and open settings. Adjust protection for individual sites, review the network log, or temporarily allow a page feature if a filter interferes with it. Choices are reversible, and no account is needed.

The extension has **no Acceptable Ads program, paid feature locks, or mandatory telemetry**. Local diagnostics never send reports automatically. Selected filter subscriptions may contact their providers for updates.

## Install for development testing

DK Live Block is still under development and is **not yet a signed Mozilla Add-ons release**. For a temporary desktop Firefox installation, download the latest source, open `about:debugging` → **This Firefox** → **Load Temporary Add-on**, and select `src/manifest.json`. Temporary add-ons normally disappear after Firefox restarts. The separately shared unsigned XPI is not suitable for permanent installation in standard Firefox.

## Privacy, support and license

DK Live Block runs its filtering locally. Optional request logs stay in Firefox, and reports are exported only on your request. Selected filter lists and optional updates contact their own providers. See the [privacy disclosure](docs/PRIVACY.md) for what is stored, which permissions are used, and network-connection details.

Report missed ads or broken websites via **[elderredsoftworks@proton.me](mailto:elderredsoftworks@proton.me)**, [GitHub Issues](https://github.com/dereksparks1982/dkliveblock/issues), or the [support guide](SUPPORT.md). Never share private links, credentials, cookies or session tokens in diagnostics.

Copyright © 2026 Elderred Softworks LLC / DK LAB. **Free for individuals and ordinary internal company use. Resale, paid repackaging and monetization of DK Live Block itself require written permission.** See the [DK Live Block license](LICENSE) for the complete terms, no-warranty disclaimer and separate third-party rights. Licensed third-party code, filter lists and media retain their own terms; see [attributions](docs/ATTRIBUTIONS.md).

[Patreon](https://www.patreon.com/c/dkliveblock) support is optional and unlocks no features.
