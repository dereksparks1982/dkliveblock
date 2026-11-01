# DK Live Block: Firefox Add-ons submission sprint, November 1–7, 2026

**Owner goal:** submit DK Live Block for a public Mozilla Firefox Add-ons listing by the end of this week. **Target submission: Friday, November 6.** Mozilla's review/approval timing is outside our control; publication by Saturday, November 7 cannot be guaranteed.

**Starting code:** Build 219 / 0.3.189, unreleased. **One branch only: `main`.** No GitHub Actions, browser auto-launches, surprise packages, or feature rewrites that risk proven ad-blocking success.

## Current demonstrated success: preserve and retest

The owner has observed successful ad blocking in regular YouTube videos, YouTube "Free with Ads" movies, Disney+ movies, CSI: Las Vegas on Disney+, and suppression of unwanted popups/visible ads on 1337x and The Pirate Bay. See `README.md` and `docs/QA_LAB.md`. These are genuine positive tests, but not a universal or measured comparison to uBlock Origin and Adblock Plus. **Do not interpret historical YouTube failures as the current outcome.**

## Release blockers as of Build 219

| Gate | Status | What clears it |
| --- | --- | --- |
| One-branch governance and backed-up working YouTube source | PASS | `main` only; historical Build 203 commit preserved in the verified `youtube-working-build-203-2026-11-01` Git tag. |
| Original-code licensing (free corporate use, no resale/monetization) | DOCUMENTED, legal review OPEN | Custom owner license in root `LICENSE`; packaged license now planned; preserve MIT-era rights and all MPL-2.0 / list licenses. |
| Source reproduction for compiled Ghostery library | **BLOCKED** | Generate and commit a real `package-lock.json` from official registry, validate package tree, independently rebuild `src/ghostery-vendor.js` and byte-compare with checked-in bundle, document exact source/link. No fabricated hashes. |
| Complete current Linux regression suite | **NOT RUN** | Exact source checkout: `bash scripts/test-local.sh`, all seven phases with zero failures. Historical successes at old commits do not clear this. |
| Full Firefox UI and streaming acceptance | PARTIAL | Clean Firefox profile, no competing blockers, ordinary YouTube and movie, Disney+ movie and television, 1337x and Pirate Bay, normal login/payment, whitelist/allowlisting, popup permissions, seek/subtitles/fullscreen, long session, RSS/CPU memory. Record exact candidate SHA and observed outcomes. |
| Bundled asset / license / privacy / permissions audit | PARTIAL | `scripts/amo-preflight.py --strict` clean, `scripts/release-audit.py` clean; source audit and Mozilla permissions/metadata review. |
| Public listing assets, source archive and reviewer notes | DRAFT | Approved icon and screenshots, accurate description and privacy disclosure, official third-party source links and reproducible source ZIP. |
| Owner acceptance and Mozilla submission | **NOT AUTHORIZED YET** | Owner approves an exact tested commit/version, annotated tag and local unsigned package. Owner signs in to AMO, uploads packages, answers store questions. |
| Mozilla validation/signing and public visibility | NOT STARTED | Depends on AMO validation and review; do not claim an approved release until AMO confirms it. |

## Proposed daily execution

**Sunday, November 1:** record working tests and branch rule; source license; Build 219 AMO preflight, packaging license, reviewer notes, manifest metadata and dated plan (source-only).

**Monday, November 2:** resolve the **real npm lockfile / reproducible vendor build**. Confirm third-party version/provenance and license notices. Fix only verified static/packaging issues.

**Tuesday, November 3:** run exact `main` seven-phase Linux checks and fix reported failures, preserving working source behavior. Record test output and exact commit. No CI.

**Wednesday, November 4:** user-chosen Firefox matrix: authenticated Disney+, YouTube, 1337x, Pirate Bay, normal browsing, sign-in and legitimate new windows; performance and privacy controls. Don't request another test after every source-only adjustment.

**Thursday, November 5:** freeze a review candidate only if tests and store policy gates pass. Review custom license and third-party obligations, re-run tests, owner-approved annotated local tag, reproducible unsigned extension ZIP plus source ZIP and source hashes. Do not submit without owner approval.

**Friday, November 6:** owner signs into AMO developer account, selects **On this site** (public listing), uploads unsigned package and reviewer source, verifies license/privacy/permissions listing metadata, then explicitly submits. Handle validation errors and review questions.

**Saturday, November 7:** follow up on submission status and review feedback. The add-on may still be under review; do not promise Mozilla approval by that date.

## Release rules

No feature-parity claim without a measured comparator test. No "all YouTube/Disney+ ads always blocked" guarantee. No installation/download offered as finished until source and browser checks meet the owner's ABP-or-better requirement. Do not remove or overwrite the Build 203 rollback tag; any further rollback is tag-based, never a second branch.

### Official Mozilla references
- https://extensionworkshop.com/documentation/publish/submitting-an-add-on/
- https://extensionworkshop.com/documentation/publish/add-on-policies/
- https://extensionworkshop.com/documentation/publish/source-code-submission/
- https://extensionworkshop.com/documentation/publish/third-party-library-usage/
