# Agent Nesty: named specialists

**Build 275, November 2, 2026.** The owner approved retiring numbered *public* names in favor of job-based titles. **One team, one accountable specialist per protection area, multiple narrow detection methods.** The number of methods/agents has no artificial cap.

| Current specialist | Actual job | Existing detectors and compatibility aliases |
| --- | --- | --- |
| **Nesty Cookie Watch** (`nesty_cookie_watch`) | Observe cookie-setting attempts without values or automatic deletion | Legacy `agent_nesty_1` HTTP response; `agent_nesty_2` cookie-change; `agent_nesty_3` script-write. Only HTTP response watcher is currently armed. |
| **Nesty Popup Guard** (`nesty_popup_guard`) | Decide when to stop unwanted new tabs, offsite redirects, and original-tab takeovers, preserving approved exceptions and video tabs | Legacy `agent_nesty_4` source-linked child detector and `agent_nesty_5` original-tab detector, plus older strict-source trap. They are detection **methods**, not separate product-facing agents. |
| **Nesty Meta Ad Scout** (`nesty_meta_ad_scout`) | Discover highly bounded Facebook Sponsored/ad signals for the existing Facebook filter; cannot independently hide posts | Legacy `agent_nesty_meta_01` through `_06`. GraphQL experiment is ON for new installs since Build 286, saved OFF respected. |
| **Nesty Layout Scout** (`nesty_layout_scout`) | Review bounded local webpage-reflow measurements and recommend manual trials only; cannot apply CSS or remove content | No legacy aliases. Build 290 integration limited to on-demand Pornhub layout diagnostics. |

## Contract for future specialists

- Name by **responsibility** (e.g. Cookie Watch or Popup Guard), never by build number or the next available numeric suffix.
- Each event can produce several signals, but a protection area has **one decision owner**. The Popup Guard alone decides its final popup/takeover verdict, deferring to existing tab, pause, login, consent and exception controls.
- Keep detection methods separately testable and privacy bounded. Do not rename saved settings keys, export formats, browser message actions or existing numeric IDs just for cosmetic consistency.
- Keep old numeric IDs as **aliases only** for historical tests and backcompat. Use the canonical IDs/names for new diagnostics, logs, interface summaries and documentation. Historical release notes need not be rewritten.
- Do not infer that every event is malicious. An unknown popup with no reliably observed source must not trigger deletion of unrelated tabs.
- Never claim Nesty Cookie Watch currently **blocks** cookies, Nesty Meta Ad Scout independently blocks Facebook, or that all popup techniques are solved.
- Read `COMPANY_BIBLE.md` first; preserve the existing extension's verified streaming paths and user-approved UI geometry.

Catalog implementation: `src/nesty-team.js`; legacy underlying detectors: `src/cookie-sentinels.js`, `src/popup-trap.js`, `src/original-tab-guard.js`, `src/meta-agent-nesty.js`.

## Inventory and future intelligence work (November 2, 2026)

**Current registered count:** exactly **4 named specialists**, **11 legacy IDs/detection methods** (3 Cookie Watch, 2 Popup Guard, 6 Meta Ad Scout). These are not 11 additional independently deployed agents.

| Status | Specialist responsibility | Notes |
| --- | --- | --- |
| Registered | **Nesty Cookie Watch** | Cookie-setting observation only. Only its HTTP-response method is armed; the other two method aliases remain documented, not guaranteed active. |
| Registered | **Nesty Popup Guard** | One accountable popup/redirect/takeover verdict with multiple input methods and user-permission safeguards. |
| Registered | **Nesty Meta Ad Scout** | Facebook Sponsored evidence and safe feed/right-rail detection. Does not independently decide to delete posts. GraphQL is an owner-toggleable experiment. |
| Registered | **Nesty Layout Scout** | Review-only, on-demand analysis of local Pornhub thumbnail/empty-slot counts. No autonomous CSS changes or video manipulation. |
| Proposed, **not registered** | **Nesty Video Ad Scout** | Distinct responsibility for YouTube/player/feed ad-delivery evidence and existing video-safe engines. Future integration must not replace the working YouTube path without tests. |
| Proposed, **not registered** | **Nesty Streaming Ad Scout** | Distinct responsibility for streaming ad breaks, media safety, and compatibility on independently verified services. |
| Potential later, **not registered** | **Nesty Provider Investigator** | Cross-company advertiser/tracker/attribution relationships and evidence quality, not automatic third-party hostname blocking. |

### Intelligence integration requirements

Existing building blocks are `src/company-modules.js` (company/host routing), `src/provider-intelligence.js` (temporary hostname-only observations), `src/meta-delivery-catalog.js` (possible delivery mechanisms), `src/adaptive-dispatcher.js` (review-only evidence pairing), and `src/adaptive-model.js` (synthetic offline classifier, not predictive AI). These are **not yet a finished coordinated learning system**.

Implement next: a profile-owned signal/event contract; a bounded read-only hypothesis/strategy registry; score and provenance checks against **real fixtures**; distinct inactive/watch/review/tested states; deterministic consent/exception precedence; reversible and measured browser interventions; privacy-safe diagnostics. Always map each new detection method under the specialist responsible for the *job*. Never expand agent count just to give an old technique a new name.

The goal is rapid identification and safe response when actual ad-serving methods change, not claims of foreknowledge or untested automatic code generation. See [playbook](NESTY_COMPANY_PLAYBOOK.md), [verification ledger](VERIFIED_SITES.md), and [company architecture](COMPANY_ADVERTISING_INTELLIGENCE.md).
