# DK Live Block Build 38: Website Access Inspector & request controls

**Version 0.3.9. UNRELEASED development source.**

### Implementation
- Add a local classifier for browser-observable resource types and likely advertising, analytics, authentication or media purposes, with clear certainty labels.
- Add three exact source-site/destination-hostname/resource-type allowances: tab-bound 10 minutes, browser-session, and saved-per-website.
- Grant only after an explicitly confirmed click on a currently captured *blocked* resource, verifying source website from Firefox's current tab rather than trusting UI arguments.
- Revoke allowances from the monitor. Validate and cap saved descriptors on restore. No arbitrary regexes, wildcard domains, custom executable snippets or host-wide allow.
- Strict popup protection and main-frame navigations are never bypassed, nor can content scripts mutate allowance state.
- Extend tests for scope, forged messages, policy isolation, and sanitization.

### Important limitations
A host/type exception may cover **more than one URL** from that hostname, including unrecognized advertising, not only the selected request. The UI explicitly warns of this. This is Firefox network activity, not OS-wide file or device access. Heuristic purpose labels are not verified statements about a request's true intention.

Complete Node/Python regression suites and live Firefox/YouTube/Disney+ acceptance remain outstanding. No release, no GitHub Actions.
