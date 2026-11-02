# DK Live Block: Nesty Company Intelligence & Continuation Playbook
**Owner direction confirmed: November 2, 2026.** This is a permanent engineering handoff, not public product advertising or a report of completed integration. Consult this alongside `COMPANY_BIBLE.md` on every continuation.

## Mission and nonnegotiable results
Keep systematically working through websites and company advertising ecosystems. Maintain company modules and platform profiles. Study how a company itself delivers/promotes ads, its directly operated advertising systems, and external advertiser, tracker, analytics, measurement and attribution partners. Group related detectors under responsibility-named Agent Nesty specialists. Anticipate plausible future changes in ad delivery, watch for real evidence of those changes, and respond rapidly with safe, site-scoped countermeasures that are tested and reversible.

**A company is not "beaten" just because one Sponsored post disappeared.** A site may have a *verified owner-observed scenario*, while other surfaces and the wider parent company remain unverified. The verification ledger is the single source of truth.

## Registered Nesty roster
| Name | Canonical ID | Scope | Historical method aliases |
| --- | --- | --- | --- |
| Nesty Cookie Watch | `nesty_cookie_watch` | Watch cookie-setting methods, no cookie-value collection or blanket cookie deletion | `agent_nesty_1`, `agent_nesty_2`, `agent_nesty_3` |
| Nesty Popup Guard | `nesty_popup_guard` | New tab, popunder, foreign redirect and original-tab takeover safeguards | `agent_nesty_4`, `agent_nesty_5` |
| Nesty Meta Ad Scout | `nesty_meta_ad_scout` | Meta/Facebook Sponsored label, post/rail and transport evidence within existing safety rules | `agent_nesty_meta_01` through `agent_nesty_meta_06` |

Exactly **3 registered named specialists**, **11 legacy detection methods**, not 14 agents. Only Cookie Watch's response-header watcher is currently armed; others have different actual runtime readiness. Nesty Video Ad Scout, Nesty Streaming Ad Scout and Nesty Provider Investigator are **ideas, not registered or deployed agents**. Add a specialist only for a genuinely different job, never for every variant of the same job, with no arbitrary maximum.

## Existing source integration, without exaggeration
- `src/nesty-team.js`: canonical names and backward-compatible aliases.
- `src/cookie-sentinels.js`, `src/popup-trap.js`, `src/original-tab-guard.js`, `src/meta-agent-nesty.js`: existing specialists and detector methods.
- `src/company-modules.js`: Meta/YouTube routing and basic profiles; Meta platforms include Facebook, Instagram, Threads and WhatsApp, but non-Facebook Meta sites do **not** share Facebook's automatic hiding.
- `src/facebook-ads.js`, `src/meta-module.js`, `src/content.js`: Facebook bounded DOM safety and newly added rapid mutation scanning. Owner saw feed/sidebar ads removed late; actual zero-flash improvement still requires a live recheck.
- `src/meta-delivery-catalog.js`: read-only inventory of 24 possible delivery families. Hypotheses, not all implemented defenses.
- `src/provider-intelligence.js`, `src/background.js`, `src/meta-intelligence-ui.js`: limited hostname-only, optional provider-request observations. A hostname and a filter verdict do not establish it belongs to an advertiser.
- `src/adaptive-dispatcher.js`: bounded, read-only evidence pairing and review results, **not** autonomous blocking.
- `src/adaptive-model.js`: synthetic offline-trained recommendation/ranking models. They are **not** production-calibrated forecasting or an AI capable of discovering new advertisements independently.
- `src/meta-graphql.js`: guarded experimental Meta schema handling; **disabled by default**, not part of the observed Facebook DOM victory.
- Orion remains separately experimental and has no blanket mobile ad-removal verification.

**The intended cross-module intelligence and AI-code integration is unfinished.** Do not claim that a source prototype or a hypothetical scenario is deployed, learned from live user traffic or automatically defended.

## Company and advertising-provider profile contract
For each researched company, maintain dated records with:
1. Legal/operator name, product/site, exact recognized hostnames, known platform ownership, separate app/platform variations, and source of the relationship.
2. First-party advertising systems, disclosed ad products, public scripts, ad response formats and endpoints with source, verification date and confidence; **exclude login, chat, payment, CDN and ordinary media endpoints unless ad-specific evidence exists**.
3. Third-party advertisers and infrastructure providers, observed request hostname/type (only with opt-in local logging), public corporate relation or explicit *unknown*, and attribution/analytics role. Do not infer an advertiser's identity from one CDN domain.
4. Surfaces such as feed, rail, search, shopping, reels, stories, stream, notifications, overlays and unwanted navigation; currently observed vs hypothesized.
5. Detection signatures, their stability, independent corroboration, version, owner exceptions, known false positives, performance and rollbacks.
6. Evidence state `hypothesis` → `observed` → `fixture-tested` → `browser-verified` → `stale/retired`, plus date, site, browser/runtime and applicable tested scenario.
7. Owner-observed result, negative controls, affected native features and current gaps. Preserve private user content; only store limited diagnostic categories and hostnames in existing opt-in mechanisms.

No accidental cross-tenant rules: a verified Meta profile does not automatically apply to every Meta app, and a provider hostname shared by unrelated services cannot be blocked merely by association.

## Nesty forward-looking delivery matrix: forecast *families*, then look for evidence
| Hypothetical provider move | Watch for | Safe response family / blockers |
| --- | --- | --- |
| Change Sponsored / Ad wording | Explicit new accessible/menu/attribution labels | Review translation/context; never hide ordinary quoted words |
| Scramble labels across spans or SVG | Visual/ARIA reference and ordered-leaf labels | Site-bounded label decode; protect author/body boundaries |
| Replace labels with hidden ephemeral portals | Short, exact referenced label + live card linkage | Bounded cache with short TTL; reject reused IDs |
| Move ads from rail to another region | Scoped Sponsored heading + bounded region geometry | One verified ad card at a time, never Contacts or the whole feed |
| Virtualize feed or insert during fast scrolling | Mutation batch, visible post/card boundary | Small immediate subtree scan + throttled fallback; prevent ordinary-post disappearance |
| Switch to server-rendered markup | Explicit ad label/attribution inside one post | Conservative pre/post rendering cosmetics |
| Insert posts through first-party GraphQL | Explicit schema and ad-only payload | Atomic, fail-open schema filtering **only after real-browser approval** |
| Stream JSONL / change envelopes | Valid record framing plus ad-only markers | Whole-response safety, never partial rewrite on ambiguity/error |
| Rename API endpoints or rotate ad hosts | Confirmed ad-specific protocol/ownership evidence | Narrow endpoint/type rules; never blanket Meta/Google CDNs |
| Hide ad identity within shadow root or iframe | Explicit marked card in reachable frame/root | Local frame/root-specific rule, preserve auth and media |
| Introduce native unlabeled promotions | Multiple independent ad-only facts | Inspector review, **not** shape-only automatic removal |
| Change sponsored stories/reels/marketplace | Surface-specific badge + independent post/product boundary | Separate scoped adapter and fixture; preserve organic content |
| Blend advertising with legitimate media or stitch ads | Confirmed segment/break metadata | Observe/research first; never destroy protected streams |
| Change attribution/tracking and redirect chains | Verified tracking endpoint + source-linked navigation | Scoped filter or Popup Guard with user-intent/login exception |
| Deploy anti-adblock or delayed re-rendering | Player health, DOM reinsert, explicit enforcement signal | Compatibility repair and staged rollout; no blind loop |

These are **plausible contingencies**, not privileged knowledge about companies' future plans. The watch list helps prioritize investigations. New network/DOM evidence earns a review, not an automatic block.

## AI and adaptive integration milestones
1. **Normalize data:** a bounded signal object with company/platform, surface, method ID, evidence category, confidence, source, model version and expiry. No arbitrary page text, full URLs, account ID, request body, cookies or data upload.
2. **Route by company:** an exact-host profile chooses potential watchers and the responsible Nesty specialist; Instagram/Threads/WhatsApp remain observation-only until verified.
3. **Detect drift:** compare current aggregated indicators and latency/failures against locally established baselines without reading private post content. A changed outcome triggers investigation, not a verdict that an ad exists.
4. **Rank hypotheses:** existing offline synthetic model may help prioritize *review*; add independently labeled browser fixtures before any ML retraining. A score must not authorize a newly generated blocking rule.
5. **Stage controls:** run safe detect-only → synthetic negative/positive fixtures → controlled Firefox/Orion browser checks → owner acceptance on affected surface → narrow verified enable. Reuse established filtering engines, exceptions and reversible restores.
6. **Test safety:** adjacent normal posts, all visible chat/contact controls, sign-in, checkout, media, manual actions, site pause and memory/scroll performance; capture false-positive rollback behavior.
7. **Keep learning grounded:** update profiles and scenario registry from dated public sources and voluntary local observations. No autonomous network crawling, remote executable code, hidden telemetry or self-updating hostile rules.
8. **Verify the outcome:** measure genuinely displayed/removed ads and unaffected regular actions, record the exact build only in `docs/`; promote only the tested scenario in the ledger.

## Working order and next tasks
1. Finish connecting the company-profile, Nesty catalog, delivery matrix, provider observations and safe dispatcher with unit tests and privacy gates. **This is not yet finished.**
2. Validate new Facebook fast-scrolling timing. Do not promote Facebook to verified while an ad remains briefly visible/clickable.
3. Investigate Facebook feed, sidebar, Marketplace, Reels and Stories independently; keep GraphQL experiment off pending accepted evidence.
4. Continue YouTube/Disney+ and popunder regression checks without destabilizing owner-observed working behavior.
5. Expand profiles and platform-specific adapters, beginning with Instagram/Threads after Facebook has adequate proof, then prioritize new sites according to owner testing.
6. Improve local evidence-ranking models with repeatable, labeled tests, independent safety vetoes, and meaningful real-browser evaluation. No claim of adaptive intelligence without evidence.
7. Keep a single verification list and company profiles in this documentation. Update when a tested behavior changes.

## Where things belong
- Public `README.md` and `README.ru.md`: product description, user-facing functions, usage/install, privacy, support, copyright/license, third-party attributions. **No build diary or roadmap.**
- `COMPANY_BIBLE.md`: governance, approved behavior and working rules. **No advertising lore or detailed architecture.**
- `docs/AGENT_NESTY_TEAM.md`: roster, exact counts, roles and aliases.
- `docs/COMPANY_ADVERTISING_INTELLIGENCE.md`: company/provider profile design and research workflow.
- `docs/META_DELIVERY_MATRIX.md`: Meta-specific possible ad-delivery techniques.
- `docs/VERIFIED_SITES.md`: scoped, dated user-observed successes, partials, pending sites and acceptance gates.
- `docs/ROADMAP.md`, `docs/STATE.md`, `docs/BUILD_*.md`: development tasks, source work, test outcomes and release notes.
- `docs/QA_LAB.md`: detailed owner-observed browser sessions and reproducible checks.

**Continuation reminder:** source code, tested fixtures, owner observations and speculative forecasts are four different things. Never turn a forecast into a claimed victory.

## Build 285 integration progress (Nov 2, 2026)
`src/nesty-intelligence.js` now translates recognized catalog/dispatcher evidence into a small set of **inert, named, platform-owned review strategies**. The bridge never enables a strategy, generates a rule, hides a DOM node, cancels navigation, or calls the network. It records browser-verification-required status, and explicitly identifies Facebook GraphQL as disabled experimental. Sibling Meta products cannot inherit Facebook responses; protected contexts veto all proposals. The private snapshot reports self-learning and automatic rule creation as disabled. Four registered integration test cases check these boundaries.

**Still unfinished:** trusted live event ingestion, measured and browser-approved response activation, cookie observation method expansion, Meta sibling-platform implementations, broader provider-source corroboration, and browser/runtime parity. This source step must not be described as a completed autonomous AI integration.
