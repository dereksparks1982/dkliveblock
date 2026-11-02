# Agent Nesty: named specialists

**Build 275, November 2, 2026.** The owner approved retiring numbered *public* names in favor of job-based titles. **One team, one accountable specialist per protection area, multiple narrow detection methods.** The number of methods/agents has no artificial cap.

| Current specialist | Actual job | Existing detectors and compatibility aliases |
| --- | --- | --- |
| **Nesty Cookie Watch** (`nesty_cookie_watch`) | Observe cookie-setting attempts without values or automatic deletion | Legacy `agent_nesty_1` HTTP response; `agent_nesty_2` cookie-change; `agent_nesty_3` script-write. Only HTTP response watcher is currently armed. |
| **Nesty Popup Guard** (`nesty_popup_guard`) | Decide when to stop unwanted new tabs, offsite redirects, and original-tab takeovers, preserving approved exceptions and video tabs | Legacy `agent_nesty_4` source-linked child detector and `agent_nesty_5` original-tab detector, plus older strict-source trap. They are detection **methods**, not separate product-facing agents. |
| **Nesty Meta Ad Scout** (`nesty_meta_ad_scout`) | Discover highly bounded Facebook Sponsored/ad signals for the existing Facebook filter; cannot independently hide posts | Legacy `agent_nesty_meta_01` through `_06`, each a separate detection/validation technique. Experimental GraphQL filtering remains OFF by default. |

## Contract for future specialists

- Name by **responsibility** (e.g. Cookie Watch or Popup Guard), never by build number or the next available numeric suffix.
- Each event can produce several signals, but a protection area has **one decision owner**. The Popup Guard alone decides its final popup/takeover verdict, deferring to existing tab, pause, login, consent and exception controls.
- Keep detection methods separately testable and privacy bounded. Do not rename saved settings keys, export formats, browser message actions or existing numeric IDs just for cosmetic consistency.
- Keep old numeric IDs as **aliases only** for historical tests and backcompat. Use the canonical IDs/names for new diagnostics, logs, interface summaries and documentation. Historical release notes need not be rewritten.
- Do not infer that every event is malicious. An unknown popup with no reliably observed source must not trigger deletion of unrelated tabs.
- Never claim Nesty Cookie Watch currently **blocks** cookies, Nesty Meta Ad Scout independently blocks Facebook, or that all popup techniques are solved.
- Read `COMPANY_BIBLE.md` first; preserve the existing extension's verified streaming paths and user-approved UI geometry.

Catalog implementation: `src/nesty-team.js`; legacy underlying detectors: `src/cookie-sentinels.js`, `src/popup-trap.js`, `src/original-tab-guard.js`, `src/meta-agent-nesty.js`.
