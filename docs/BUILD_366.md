# Build 366: audit the active full Facebook engine, not the old scanner

**Version:** 0.3.336. **Date:** 2026-11-04. **Status:** source QA only, unreleased.

- Expand read-only checkpoint auditor to check the actual early-injected Facebook-only full MIT runtime and that it precedes DK's general content script.
- Assert all ten user-required mechanisms remain in the active source, along with the 50ms retry mechanism, site-authorization/pause gates, complete user options, privacy-safe diagnostics and latest regression file registration.
- Five negative mutation tests deliberately remove an engine, guard, UI field or test registry entry and require the audit to reject the source candidate.
- Preserve the existing source-only checkpoint's explicit no-live-Firefox/no-native-suite/no-release verdict. No added permission, telemetry, GitHub Actions or popup geometry changes.
