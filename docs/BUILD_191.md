# Build 191: sanitize YouTube first-party filter attribution

**Unreleased source:** 0.3.161, 2026-11-01.

Filter-list names in YouTube triage must use a strict text-only character set, so an untrusted subscription label cannot appear in a diagnostic export as a URL, multiline injection, or private query string.

Changes are source-level and accompanied by permanent regression cases. Full Ubuntu suite and live Firefox comparison are not verified here. No public release, GitHub Actions, user package, or automatic browser launch.
