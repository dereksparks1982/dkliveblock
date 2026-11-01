# DK Live Block: Company Bible

**Project:** DK Live Block / DK LAB / Elderred Softworks  
**Repository:** `dereksparks1982/dkliveblock`  
**Authority:** Project-owner instructions. This is the active DK Live Block project governance document.  
**Established:** November 1, 2026.

## 1. One-branch rule (owner-required)

**Exactly ONE Git branch is allowed in this repository: `main`. No exceptions.**

- Do **not** create development, feature, fix, documentation, release, snapshot, experimental, temporary, or other Git branches.
- Do **not** use pull requests or branching workflows that require another branch.
- Work directly on the existing `main` branch. Read current source and roadmap first; make only authorized changes, commit to `main`, and verify the GitHub result.
- Do **not** recreate deleted branches in subsequent builds or documentation updates.
- Backup and restore points must use immutable **Git tags** and approved local archives, **not Git branches**. Tags are not branches.
- Before removing old non-`main` branches, verify `main` contains all their commits and a necessary baseline is preserved by tag/archive. The owner decides when to delete them.
- If a proposed change would require a second Git branch, propose a single-branch alternative instead. Never silently override this rule.

## 2. Working behavior is protected

The owner observed DK Live Block successfully suppressing ordinary YouTube video ads, YouTube "Free with Ads" movie ads, Disney+ advertising during movies and CSI: Las Vegas, and unsolicited advertising tabs/popups on 1337x and The Pirate Bay. Those real-browser observations are documented in `README.md` and `docs/QA_LAB.md`. Do not mislabel previously resolved symptoms as a currently verified failure. Preserve the existing working blocking and streaming paths; only change them for a demonstrated issue and with appropriate regression coverage.

**Known-good YouTube source:** Build 203, version `0.3.173`, commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.  
**Verified existing Git tag:** `youtube-working-build-203-2026-11-01`, pointing to that exact commit.  
This tag is the repository-backed rollback reference; a snapshot branch is **not** required.

## 3. Builds, validation and releases

- Keep changes within the user's authorized scope. Larger planned builds are welcome, but never silently alter approved behavior or UI geometry.
- Update relevant README/roadmap/release notes with truthful evidence; distinguish observed working results from incomplete automated or browser acceptance.
- **Never use GitHub Actions.** Run tests locally on Linux where possible; don't claim unrun checks passed.
- No external filtering-engine installation for ordinary users. DK Live Block must remain a simple self-contained Firefox extension.
- Do not provide an installable download or declare feature parity/public readiness before actual tests and owner approval.
- Preserve normal site functionality, login windows, privacy, safe browsing permissions, and reversible user choices.
- Do not automatically open browsers, request passwords, or make unrelated repo changes.

## 4. Free use, no monetization (owner-required)

**Any person or company may use DK Live Block for free. Nobody may profit by selling, charging for, rebranding, packaging as a paid product, or monetizing the DK Live Block extension or derivatives.** Ordinary internal use by businesses, even profitable businesses, is allowed. Profits from a company's unrelated business do not make its internal use of the extension prohibited.

Apply this distinction in the `LICENSE` and `README.md`. Do not claim that an older MIT grant has been revoked: previously published MIT-licensed versions retain the rights granted to their recipients. Never pretend that proprietary original-code restrictions supersede bundled MPL-2.0 components or independent third-party filter-list licenses. Before public release, verify legal enforceability and Mozilla distribution requirements; the license is custom source-available, not OSI-approved open source.

## 5. Owner control and proposals

The owner can revise project rules. Improvements and alternatives may be **proposed** with their reasons, but changes to a rule or established project behavior require explicit owner authorization. Proposing an improvement is allowed; silently implementing a conflicting process is not.

## 6. Branch cleanup verification (November 1, 2026)

A comparison of `main` against all five non-`main` branches found **zero commits on any extra branch that were missing from `main`**. The Build 203 recovery tag was independently verified to match its documented commit. The owner may safely delete all five extra branches and retain only `main`; the Git history and tagged working backup stay preserved.

**Permanent policy after cleanup: `main` is the one and only branch.**
