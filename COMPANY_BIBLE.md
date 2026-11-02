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

The owner observed DK Live Block successfully suppressing ordinary YouTube video ads, YouTube "Free with Ads" movie ads, Disney+ advertising during movies and CSI: Las Vegas, and unsolicited advertising tabs/popups on 1337x and The Pirate Bay. Those real-browser observations are documented in `docs/QA_LAB.md` and the scoped verification ledger, not in the public README. Do not mislabel previously resolved symptoms as a currently verified failure. Preserve the existing working blocking and streaming paths; only change them for a demonstrated issue and with appropriate regression coverage.

**Known-good YouTube source:** Build 203, version `0.3.173`, commit `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.  
**Verified existing Git tag:** `youtube-working-build-203-2026-11-01`, pointing to that exact commit.  
This tag is the repository-backed rollback reference; a snapshot branch is **not** required.

## 3. Builds, validation and releases

- Keep changes within the user's authorized scope. Larger planned builds are welcome, but never silently alter approved behavior or UI geometry.
- Update roadmap, engineering notes and the scoped verification ledger with truthful evidence; distinguish owner-observed behavior from complete automated or browser acceptance. Keep README files strictly product-facing.
- **GitHub Actions policy (owner revised November 2, 2026):** The previous blanket prohibition is lifted because the usage allowance has reset. Prefer local Linux testing. Use GitHub Actions **sparingly and only when genuinely necessary**, such as significant integration, compatibility, or release checks that cannot reasonably be verified locally. Do not run workflows simply because a build or small commit exists, or add routine CI triggers without a justified need.
- For any justified Actions run, keep the jobs targeted and efficient; minimize billed minutes, artifact uploads, storage, and retention. Do not create or retain unnecessary artifacts. Record actual test results accurately; never claim an unrun check passed.
- No external filtering-engine installation for ordinary users. DK Live Block must remain a simple self-contained Firefox extension.
- Do not provide an installable download or declare feature parity/public readiness before actual tests and owner approval.
- Preserve normal site functionality, login windows, privacy, safe browsing permissions, and reversible user choices.
- Do not automatically open browsers, request passwords, or make unrelated repo changes.

## 4. Agent Nesty team naming and ownership (owner approved November 2, 2026)

The public names for Agent Nesty specialists **describe their responsibility**, not numeric sequence. Organize related detection methods under one accountable specialist per protection area. The agreed names currently are **Nesty Cookie Watch**, **Nesty Popup Guard**, and **Nesty Meta Ad Scout**. Existing numeric identifiers remain as compatibility aliases for historic code/tests; do not rename unrelated persistent storage or protocols. Specialist teams may grow without a fixed numerical limit. A new specialist is justified by a genuinely different responsibility, not merely another popup trick. See [team catalog](docs/AGENT_NESTY_TEAM.md). Protect functioning blocking paths and require regression checks for any future consolidation.

## 5. Free use, no monetization (owner-required)

**Any person or company may use DK Live Block for free. Nobody may profit by selling, charging for, rebranding, packaging as a paid product, or monetizing the DK Live Block extension or derivatives.** Ordinary internal use by businesses, even profitable businesses, is allowed. Profits from a company's unrelated business do not make its internal use of the extension prohibited.

Keep the public licensing message focused on free personal and internal company use, with no resale or monetization of DK Live Block itself. Maintain required third-party notices in their proper license files and validate Mozilla submission requirements before publication.

## 6. Owner control and proposals

The owner can revise project rules. Improvements and alternatives may be **proposed** with their reasons, but changes to a rule or established project behavior require explicit owner authorization. Proposing an improvement is allowed; silently implementing a conflicting process is not.

## 7. Branch cleanup verification (November 1, 2026)

A comparison of `main` against all five non-`main` branches found **zero commits on any extra branch that were missing from `main`**. The Build 203 recovery tag was independently verified to match its documented commit. The owner may safely delete all five extra branches and retain only `main`; the Git history and tagged working backup stay preserved.

**Permanent policy after cleanup: `main` is the one and only branch.**

## 8. Nesty company intelligence, verification and README boundary (owner direction, November 2, 2026)

- **Canonical permanent project memory:** [Nesty/company playbook](docs/NESTY_COMPANY_PLAYBOOK.md), [team roster](docs/AGENT_NESTY_TEAM.md), [company/ad-provider architecture](docs/COMPANY_ADVERTISING_INTELLIGENCE.md), [Meta delivery matrix](docs/META_DELIVERY_MATRIX.md), and [scoped verified-sites ledger](docs/VERIFIED_SITES.md). Read these before building or declaring a company/site complete.
- **One company module with platform-specific profiles** (Meta: Facebook, Instagram, Threads, WhatsApp; Google/YouTube and others as evidenced). Investigate both the company's own delivery systems and external advertisers, trackers, analytics and attribution providers. Record which relationships are observed, publicly documented, suspected or unknown. Never classify all first-party resources or a third-party host as ads merely by ownership.
- **Nesty specialists are named by job**, not numbered techniques. The three currently registered canonical specialists account for eleven historical detection aliases. A separate responsibility merits a new specialist; another variant of the same responsibility belongs under the existing specialist. No arbitrary cap on legitimate specialist responsibilities.
- **Anticipatory defense:** maintain a bounded hypothesis matrix for possible ad-delivery changes (DOM and accessibility labels, GraphQL/JSONL, first-party requests, mobile/virtualized feeds, shadow roots, iframe and media variants, attribution and popups). Test candidate strategies in fixtures, observe genuine evidence, then route to the existing safe engine. A forecast, AI score or changed host alone **cannot authorize deleting ordinary content**.
- **Company victory claims must be scoped and earned:** document the exact site/surface, owner-observed browser result and date, version where known, negative controls and outstanding gaps. Facebook's owner-observed late ad removal is *partial*, not verified zero-flash behavior. Do not advertise defeat of an entire corporate advertising ecosystem based on one test.
- **README.md and README.ru.md** describe what DK Live Block is, what users can do, installation/usage, privacy, support, legal/license and third-party notices. They must **never contain build numbers, changelogs, implementation diary, roadmap tasks, engineering predictions, agent-training notes or company victory scorekeeping**. Those belong in `docs/`.
- Preserve approved website/banner geometry, recorded working blocking paths, reversible owner exceptions and privacy. Continue work on `main` only. GitHub Actions are permitted **sparingly** for genuinely necessary verification under Section 3, not forbidden wholesale.

## 9. One shared extension intelligence core, platform-specific capabilities (November 2, 2026)

- Maintain **one canonical source repository** and one common Nesty detection/intelligence codebase. No separate browser-specific copies of company intelligence.
- Firefox, Orion and proposed Yandex/Chromium adapters may use different manifests and native network APIs. Detect capabilities rather than assuming parity from a browser name or user-agent. Retain dormant compatible modules when harmless; omit modules only when their inclusion makes the target package invalid or unsafe.
- In unsupported browsers, a feature must be unavailable or observation-only, never pretend to block by silently skipping critical network enforcement. Do not apply Firefox-only APIs to Chromium, or assume Orion has desktop API parity.
- Porting the source is **not** verification. Browser-specific capabilities, sign-in safety, disabled state, privacy and ad-removal results need actual device testing. Preserve the owner-approved Firefox blocking paths until a separate adapter proves equivalent.
- Company profiles and advertising-delivery hypotheses may inform Nesty investigation, but confidence scores, domain relationships or synthetic model rankings never authorize deleting ordinary content or broadening blocking.


## 10. Russia-facing legal readiness without locale-based censorship (owner direction, November 2, 2026)

The owner wants DK Live Block available to Russian users and Russian-speaking people, including family and friends, without nationality-based discrimination or blanket geography restrictions. **Russian nationality, citizenship, language, place of birth or lawful personal contact is not a reason to refuse free access, support or ordinary ad blocking.** Regulatory diligence is required for specific regulated activities, but do not misrepresent U.S. sanctions as a general ban on communication with Russians or free public internet software; see OFAC General License 25G and FAQ 1040. Unsupported claims of Russian state approval or complete regulatory compliance are prohibited. See the [Russia-facing compliance review](docs/REGIONAL_COMPLIANCE_RUSSIA.md) for narrow, activity-specific questions, not a countrywide denial policy.

- Preserve the ordinary ad-blocking and privacy product; Russian-language choice does **not** prove residence/citizenship and must not silently reduce protections, change filters, make legal assumptions or trigger geolocation/telemetry.
- Do not advertise DK Live Block as a VPN, proxy service, censorship bypass or way to reach restricted resources. Its existing **optional user-configured proxy routing** is OFF by default but poses an unresolved Russia-specific legal classification question. Preserve current functionality unless the owner approves a tested change; obtain legal review before Russia-directed distribution.
- Avoid paid/promotional placement on platforms where Russian law prohibits advertising. Treat marketing restrictions as distinct from blocking advertisements locally in a browser.
- Keep user-facing Russian license, support, privacy and connection disclosures accurate and accessible. An English-only fallback or partial localization is not proof that all required Russian consumer information has been supplied.
- Do not begin collecting Russian users' personal data, add developer-operated cloud telemetry or enable automatic report uploads without legal/data-flow review. Existing opt-in user-sent support emails and external filter-list connections also need privacy assessment.
- Require owner sign-off and appropriate qualified legal review for market-specific compliance claims. Do not demand sanctions screening of ordinary users or block an entire country merely out of caution. Specific prohibited transactions, if any, require case-by-case handling. No mandatory special access, hidden monitoring or government data transmission is implemented by this instruction.
