# Build 215: default-on, source-attributed phishing threat intelligence

**Version:** 0.3.185 (unreleased, November 1, 2026). **Observed-working YouTube rollback:** preserved tag `youtube-working-build-203-2026-11-01`.

## User need

DK Live Block should identify *why* something was blocked and, separately from ad filtering, block reliably sourced threats by default while allowing users to disable protection globally or override an exact hostname. Unknown domains must never be described as malicious solely because their names look unusual.

## First provider and scope

- First independently maintained source: **Phishing Army** domain-only feed, `https://phishing.army/download/phishing-army-domains.txt`. Read the provider's [blocking policy](https://phishing.army/blocking-policy/) and [usage/licensing terms](https://phishing.army/license/), including third-party upstream restrictions, before redistribution or commercial packaging.
- This build covers **phishing-domain listings only**, and excludes the feed's published harmless demo hostnames from genuine threat classification. It does not claim to classify malware, spyware, spam, scam scripts, or all deceptive redirect sites.
- A listing means the publisher/upstream source associated the hostname with phishing activity. It does not establish who owns it, whether its operator was complicit, or what a particular request attempted.

## Implementation

- The bundled `threat-database.js` strictly parses bounded plain-hostname records; it never executes scripts/filter directives. HTML and server errors, enormous lists, and suspiciously large decreases in the number of entries are rejected.
- Fresh installs default to `threatProtection:true`. The existing daily alarm and explicit refresh download a verified list over HTTPS; cached records remain usable offline and after errors. No user's browsing hostname or full URL is submitted for reputation lookups.
- A local exact-host match cancels navigation or a subresource before normal ad rules; allowing a *website's advertising* does not override the threat database. The user may turn threat protection off or supply an exact destination hostname in Settings. Normal ad-filter matching continues unchanged.
- Settings display provider, entry count, update timestamp, staleness and errors, plus a refresh button and exception textarea. Site Dashboard/export shows source-backed threat classification for logged blocked subresources. A blocked main-page navigation currently uses Firefox's native load failure, not a custom explanatory warning page; navigation recovery UI remains future work.
- No new Firefox permissions, extra native applications, telemetry, external engine download, Actions, README release history or release artifacts.

## Verification and limitations

- Eight focused V8 checks passed; the ninth, testing bundled source wiring, is registered for the local Linux suite. The complete Node suite and live Firefox were not run in this environment.
- The third-party feed can be wrong, temporarily unavailable or subject to licensing limits. Check those terms and test sign-in, banking, streaming and first-run behavior before public release.
- Next: opt-in detailed domain ownership and hosting investigation; additional vetted categories; a clear interstitial and one-click override for blocked main-frame navigation.
