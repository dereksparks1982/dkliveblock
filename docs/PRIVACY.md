# DK Live Block: Privacy disclosure (draft for public review)

DK Live Block is an independent Firefox extension developed by DK LAB / Elderred Softworks. It requires **no account**, has **no premium tier** and sends **no analytics or telemetry to DK LAB**. It does not sell user data.

## Information stored locally
Blocking preferences, custom filters, locally cached third-party filter lists and aggregate blocked-request counts are saved in Firefox extension storage. If enabled, a bounded, temporary per-tab log stores **hostnames and filter rule identifiers, not complete URLs**. Failed-request diagnostics similarly store only hostnames, request types, error categories and timestamps in memory. These logs disappear when the extension process ends and can be cleared manually. Disabling logging stops new records.

## Network connections initiated or affected
Default filter-list updates contact the EasyList and EasyPrivacy hosts. Optional lists contact their own hosts. These third-party hosts necessarily receive connection metadata (such as IP address) when Firefox downloads a list. DK LAB does not operate those hosts or control their policies.

When the user explicitly runs a DNS diagnostic, Firefox's configured DNS resolver receives the query. The extension does not install or silently configure a DNS-over-HTTPS provider.

**Proxy and Open Access routing are off by default.** If the user opts in and configures an external proxy, selected network requests may pass through that proxy. The proxy operator can observe connection metadata and may observe unencrypted HTTP content. HTTPS ordinarily protects content in transit, subject to the browser's trust and certificate settings. DK LAB does not provide, operate, or collect data from a proxy server.

Firefox's proxy API is **not a kill switch** and may still allow a direct connection after a proxy failure. This extension is not a VPN, an anonymity service, or a guarantee against censorship or monitoring.

## Permissions
- **webRequest, webRequestBlocking and host access:** identify and block requests covered by ad-filter rules.
- **tabs, webNavigation:** handle site pause, request counters and explicit popup rules.
- **storage and alarms:** store settings and update filter lists on a schedule.
- **proxy:** optional routing to a proxy configured by the user.
- **dns:** diagnostics only when requested in the settings page.

## What DK Live Block does not do
It does not upload browsing history, captured passwords, form data, private page text, or user-selected proxy credentials to DK LAB. It does not run scripts supplied by filter subscriptions.

This disclosure must be reviewed and updated against a real candidate build and actual Mozilla Add-ons submission questions before publication.

### YouTube maintenance updates

When automatic YouTube compatibility checks are enabled, Firefox fetches a data-only cosmetic filter list from `raw.githubusercontent.com`. The CDN receives ordinary connection metadata. DK LAB does not receive browsing history, YouTube video URLs, playback state, account information or error reports. Users can disable this update channel, check manually, or roll back a bad filter pack.

## Voluntary support and bug reports (Build 37)

Developer email: **elderredsoftworks@proton.me**. The Firefox extension does not transmit diagnostics, browsing logs, site URLs or any other data to this address automatically. Selecting **Report a Problem** opens a local form. The reporter must supply the description and optionally the issue category, reproduction steps and affected website. The draft includes the extension version and only the website's hostname, not its URL path or query parameters. It is displayed for review; pressing **Prepare email** opens a `mailto:` draft in the user's mail application, where they decide whether to send it. Alternatively, the report can be copied locally. The privacy practices of the user's chosen email service apply when they actually send an email.

## Local Website Access Inspector and request allowances (Build 38)

When the user starts the optional Network Monitor, DK Live Block keeps only bounded per-tab request **hostname**, resource type, request method, status and coarse reason information in memory. The Access Inspector uses these fields to generate tentative explanations and clearly labels guesses. It does not monitor local computer processes, read response bodies or inspect files.

The user may explicitly allow a blocked source-site/destination-hostname/resource-type combination for ten minutes (one tab), the current browser session or across restarts. Only the last category is stored in Firefox local extension settings, with no full URL, path, query string, account token or response data. They can revoke it from the monitor. The extension does not contact the developer or any remote telemetry service.
