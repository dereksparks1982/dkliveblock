![DK Live Block neon banner](assets/images/DK%20Live%20Block%20Neon%20Banner.png)

**English | [Русский](README.ru.md)**

# DK Live Block

## DK Softworks · House of Culture

**DK Softworks** is the studio and project identity. **DK** draws on the Russian abbreviation **ДК** for **Дом культуры** (*Dom kultury*), meaning **“House of Culture.”** Traditionally, a *dom kultury* is a community center for the arts, creativity, performance, and learning.

This identifies the present project or its stewardship; it does not change existing licenses, copyright holders, original creators, or historical credits.


**DK Live Block** is a free Firefox-first browser extension from DK Softworks that helps block advertising, tracking requests, intrusive popups, unwanted tabs, and distracting page elements.

**Development status:** Active pre-release. Facebook Sponsored removal and ordinary YouTube playback still require real Firefox verification. Source checks alone do not prove universal advertising removal or uBlock Origin parity. No public release has been approved.

**Build 411 scriptlet safety:** The existing user-authored, domain-scoped scriptlet rules receive a compatibility and overlapping-property safety audit. Ghostery's bundled scriptlet rules remain **non-executable** in DK Live Block; no additional third-party scriptlet source, privilege, or runtime dependency is installed. See [Build 411 details](docs/SCRIPTLET_COMPATIBILITY_BUILD411.md).

**Build 410 Nesty evaluation:** An offline-only, synthetic site-held-out measurement harness is documented in [the Nesty evaluation report](docs/NESTY_EVALUATION_BUILD410.md). It measures false-positive risk and refuses automatic deployment; it does not train on visitor activity or replace tested browser filtering.

**Build 409 portability research:** The optional, developer-only Brave Rust comparison and Safari content-blocker conversion experiment is documented in [the portability study](docs/BRAVE_SAFARI_PORTABILITY_BUILD409.md). It is **not** installed in the Firefox extension or verified on Orion iOS.

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
