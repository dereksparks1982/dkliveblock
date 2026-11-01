# Build 171: offline packaging and asset-closure audit

**Version:** 0.3.141 (unreleased), 2026-10-31.

## Why this build exists
A test-file inventory is not enough to guarantee that Firefox can load every packaged script and style. A missing local dependency breaks features before the user has an opportunity to test.

## Changes
- Added `scripts/asset-integrity.js`, a read-only local audit of Firefox manifest background and content script files, packaged icons, popup/options/devtools pages, redirect resources and the JavaScript/CSS references in **all** `src/*.html` pages. It rejects remote script URLs and directory-traversal paths.
- Added `tests/asset-integrity.test.js`, covering missing scripts/styles/redirects, remote and traversal attempts, and normal local HTML parsing. Registered it with the existing seven-phase offline runner. The Node inventory now has **117** unique test files.
- Checked the new audit logic against the exact pre-build GitHub tree and contents of all 10 HTML pages. It found **87 valid references, no missing paths**. This is source-level evidence, **not** a full Node suite pass.
- README and version updated before commit. No Firefox UI geometry, filter behavior, video interception, request permissions, GitHub Actions or packages changed.

## Verification limitations
The complete repository is accessible through connected GitHub, but not as a runnable source checkout in the isolated Linux tool environment. A public `git ls-remote` attempt could not resolve GitHub. Therefore the full seven-phase Ubuntu Node/Python suite has **not** been executed; claiming it passed would be inaccurate. The complete checkout must be run in an approved Linux environment before signing or release.

**Next planned build: 172**. Improve native filter compatibility with precisely scoped, safe new syntax and regression cases, not arbitrary remote scriptlets. Preserve existing YouTube/movie playback until evidence supports a change.
