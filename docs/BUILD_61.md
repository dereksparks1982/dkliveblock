# Build 61: first-test readiness engineering

**0.3.32 | UNRELEASED source | October 30, 2026**

- Fixed a stale Build 59 manifest-version assertion that would have failed after every subsequent version bump.
- Added a pre-engine signed-navigation guard. Filtering can remove marketing query keys, but on signed/HMAC, CDN token or login callback URLs, even a benign rewrite can invalidate a signature or SSO request. Both DK's query cleanup and the native filter engine's independent $removeparam processing now skip those protected navigations. Normal marketing URL cleanup remains enabled.
- Added signed-link and forced-removeparam regression cases, plus a focused integration assertion in the existing Firefox-like background test.
- Limited each Node test phase to two concurrent test processes to avoid exhausting RAM on smaller Ubuntu systems; kept the phases separate for diagnosis.
- Added an offline inventory gate for all Node test files and Python test scripts. A synthetic self-test verifies that missing, duplicate and forgotten tests cause a failure, so the suite cannot silently skip new coverage.
- Extended the offline package audit to check manifest/package version agreement.
- Added a specific first-test acceptance matrix and blocker criteria in docs/TEST_CANDIDATE_GATE.md.

**Scope and evidence limitation:** The development runtime cannot reach GitHub directly or materialize the connector's entire repository as a local checkout. Source syntax/static and focused isolated checks can be done, but the complete real Node/Python suite, on-device Firefox installation, live YouTube/Disney+ playback and long-session memory tests must still be run from a proper local checkout. Do not mark them passed or generate a package automatically.

No GitHub Actions, new permission, external dependency, test download, signing or public release.

## Follow-up: first real Ubuntu QA results

The initial offline structural phase ran 115 cases: 112 passes and three obsolete pinned-version assertions. Corrected the three tests to compare package.json dynamically and added a regression guard against future hard-coded version expectations. The complete suite is still awaiting another desktop run. This is a QA fix, not a new release.
