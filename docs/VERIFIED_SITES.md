# DK Live Block: Verified Sites and Company Advertising Coverage
**Snapshot: November 2, 2026.** Source of acceptance: owner-observed browser behavior from project conversation and `docs/QA_LAB.md`. This is the scoped verification ledger, not proof that all ads of a company are defeated. Preserve the owner's successful observations without exaggerating them.

## Meaning of statuses
- **Owner-observed PASS (scoped):** the owner used the browser and confirmed a described effect on a named site/surface. It is a real observation, not independent certification, a promise about all future versions, or a universal company-wide defeat.
- **PROVISIONAL:** positive but insufficient duration/scenarios, or important playback/interaction acceptance still open.
- **PARTIAL:** ads are removed or blocked in observed cases, but visible misses/late handling remain.
- **UNVERIFIED:** code, simulation, hypothesis or older reports exist, but no sufficiently positive current owner-observed acceptance.
- **Regression-needed:** a previously observed success should be checked again after relevant changes; do not erase or reverse history just because the latest source has not been retested.

## Owner-observed successes: precise sites and surfaces

| Platform/company profile | Site and surface observed | Status and evidence | Limits / next check |
| --- | --- | --- | --- |
| YouTube (Google-owned platform) | Ordinary YouTube videos; ads suppressed in owner's Firefox session | **Historical owner-observed PASS (scoped), Nov 1; IN-PLAYER REFUSAL CONFIRMED BY SCREENSHOT Nov 3** | Owner screenshot confirms YouTube refuses ordinary-video playback inside the player. Root cause, installed revision and repair still unknown. Keep working-source tag and investigate before claiming repair. |
| YouTube (Google-owned platform) | YouTube movies labeled **Free with Ads** | **Owner-observed PASS (scoped)**, Nov 1 | No blanket guarantee for new movie/video advertising methods |
| Disney+ (Disney streaming platform) | Movie playback with DK protection on; ads not shown | **Owner-observed PASS (scoped)**, Nov 1 | Separate request logs support specific network blocks, not a guarantee for every title or ad break |
| Disney+ (Disney streaming platform) | *CSI: Las Vegas*, owner compared DK off/on | **Owner-observed PASS (scoped)**, Nov 1 | Keep protected playback/login behavior; repeat after major changes |
| 1337x (website/mirror, not an independently established corporate parent) | Advertising tab/focus takeover, verbally reported `1337x.tw` | **Owner-observed PASS (scoped)**, Nov 1 | Companion export names `1337x.la`; do not falsely conflate mirror hosts or claim every popunder type |
| The Pirate Bay (website) | Visible advertising overlay and unwanted ad windows/tabs | **Owner-observed PASS (scoped)**, `thepiratebay.org`, Nov 1 | Normal intentional tabs, links, user-permitted exceptions and downloads require protection |
| Pornhub (website) | Owner confirms ads are being removed; video-thumbnail listing has two videos separated by a large former-ad gap | **Owner-observed ad blocking (scoped)**, Nov 2; layout repair **pending testing** | Build 288 proposes opt-in CSS reflow; no actual owner Firefox layout PASS yet, unknown current HTML selectors and exact DK install version |

## Positive, partial or still in progress

| Platform/site | Status | Evidence / next gate |
| --- | --- | --- |
| Facebook / Meta, `facebook.com` | **PARTIAL** | Owner saw right-side Sponsored ads flash and disappear, plus feed ads that remain briefly clickable then vanish, replaced by ordinary posts. Build 280 fast path was added, but its real Firefox speed has not been retested. Do not promote until rapid scrolling shows no persistent or clickable ad and normal posts, menus and Contacts remain intact. |
| XNXX | **Positive owner-observed behavior, additional regression needed** | Owner earlier confirmed visible advertising cleanup and popup improvements. Several later video/preroll compatibility changes need site-specific retest. Historical observations are not erased; no universal PASS claim here. |
| CBS News | **PROVISIONAL** | Advertising cleanup/playback improved; long playback across ad breaks and article/home video behavior still need owner retest. |
| Meta Instagram | **UNVERIFIED** | Profile/routing exists, but Facebook's DOM hider is not automatically applied to Instagram. Separate fixtures and browser checks required. |
| Meta Threads | **UNVERIFIED** | Same platform-specific requirement. |
| Meta WhatsApp | **UNVERIFIED** | No assumption that a Meta-owned communication app shares Facebook ad delivery. |
| Orion (browser adapter) | **UNVERIFIED / experimental** | An integration experiment is not verification of desktop Firefox parity or iOS network filtering. |

## Verification checklist before promoting a row
1. Capture the **exact site hostname and feature/surface** (feed, right rail, story, reel, search, popup, video), not the entire company's name.
2. Record date and actual Firefox/Orion version and installed DK commit/version **when available**; if absent, explicitly say unknown.
3. Confirm ad visible when protection off or otherwise independently identifiable, and suppression when on. A detector counter alone is not proof.
4. Repeat after reload and rapid scrolling, including delayed inserts, and note whether ads flashed, stayed clickable, or reappeared.
5. Confirm ordinary content, chat/contacts, authentication, media, forms, navigation, deliberate new tabs and exact-site exceptions remain functional.
6. Verify no false-positive removal, performance regression or unbounded scanning. Check pause/undo restoration.
7. Promote **only** the actually tested scenario after owner confirmation. Store detailed test logs in `docs/QA_LAB.md` and action items in `docs/ROADMAP.md`.
8. If new evidence contradicts a PASS, record regression and current candidate status; preserve the earlier dated observation rather than silently rewriting history.

### Corporate providers versus sites
YouTube and Disney+ represent **scoped product-level** successes, not confirmed defeat of all Google or Disney advertising. 1337x and The Pirate Bay are verified *website behaviors*, not corporate advertising platform ownership claims. Facebook is a **partially working Meta platform**, not yet a verified company victory. Ad-server/request destinations in Meta Intelligence are **unknown third parties** until independent research establishes the actual advertiser, provider or tracker.

Read [Nesty/company playbook](NESTY_COMPANY_PLAYBOOK.md), [company intelligence design](COMPANY_ADVERTISING_INTELLIGENCE.md), [Nesty roster](AGENT_NESTY_TEAM.md), and [QA observations](QA_LAB.md). Do not move this internal scorekeeping into the public README.
