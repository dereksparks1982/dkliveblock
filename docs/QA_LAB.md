# DK Live Block: localhost manual QA lab

This test page contains fake ads, not real ad-network requests. It tests display hiding and restoration, never YouTube, Disney+, DRM, third-party downloads, or Adblock Plus parity.

When a local Firefox check is authorized, run python3 scripts/qa-lab.py inside a DK Live Block source checkout. The Python standard-library server binds only to 127.0.0.1:8765 and prints the lab URL. It does not automatically open a browser. End with Ctrl+C.

Checks: default ad markers should disappear; a dynamically inserted ad should disappear shortly after clicking its button. Open and nested Shadow DOM ad markers should also disappear. A closed Shadow DOM fixture should remain. A sponsored article, sign-in form, ad-labelled content nested inside a form/article, and video controls must remain usable. After pausing protection for 127.0.0.1, prior hidden slots should reappear. Resume, then repeat. Cookie reject/accept fixture buttons are recorded visibly, and no unintended acceptance should occur.

This is a convenience fixture only. Run the full local regression suite and all real Firefox, YouTube, Disney+, cookie-consent, login, popunder, performance, filter-update and license checks before approving release. Never publish private browsing logs.


## First-test sequence and recording

Do not package or publish until the complete offline suite succeeds. When the user decides to test, use an unpacked Firefox development profile and inspect the add-on toolbar and Site Dashboard first. Check a normal news site, an untrusted popup-heavy site (no automatic new tabs), a signed/download link, a cookie rejection example, a legitimate sign-in and a video player in that order. Then perform YouTube playback cases and Disney+ only where the user's account and Linux browser are supported. Keep only hostname-level diagnostics. Mark a failed control, missing script, crash, major performance regression, accidental Accept All or video corruption as **blocking**. Unverified results are **not passes**.

The current readiness gate and results template are in docs/TEST_CANDIDATE_GATE.md.


## Manual Firefox observation: 1337x forced-tab prevention (November 1, 2026)

**Status: PASS for the specific user-observed behavior; not a full popup regression pass.**
The user tested DK Live Block enabled on a 1337x mirror and observed an advertising-page attempt to open a new tab and pull focus away from the current tab. With DK Live Block enabled, the unwanted opening/focus switch was successfully prevented. This is **user-reported live Firefox behavior**, not a claim derived from the blocked-request JSON.

**Host disambiguation:** The user verbally identified `1337x.tw` (typed once as `1137x.tw`), while the accompanying exported blocked-request report identifies `1337x.la`. Preserve both observations without treating them as the same verified host or asserting a redirect.

**Independent report evidence:** The JSON captured at `2026-11-01T09:35:49.816Z` identifies website `1337x.la`, hybrid filtering, and 17 blocked network requests (all 17 retained/exported). Matched sources include EasyList, EasyPrivacy and Fanboy Annoyances. The JSON does **not** contain a distinct new-tab interception or popup history event, so it cannot alone prove which guard prevented the forced opening.

**Development candidate:** Testing occurred after the Build 214 (v0.3.184) local-update instruction. The JSON itself does not carry an extension version or commit SHA; treat the exact tested revision as **user-context inferred, not export-verified**.

**Next acceptance checks:** Repeat against both named mirror hosts when convenient, confirm a normal user-authorized new tab still opens using the explicit permit, verify strict blocking when enabled and no unintended blocking after pause/allowlisting, and inspect popup history/count separately. This single successful observation is not evidence that strict protection works on all sites.


## Owner-observed live ad blocking: YouTube and Disney+ (November 1, 2026)

**Status: positive owner-observed Firefox tests, not a universal compatibility or release certificate.** The owner has explicitly confirmed successful advertising suppression on ordinary YouTube videos and on YouTube movies marked "Free with Ads." These newer successful observations supersede older unresolved symptom reports **for the sessions tested**. Protect the preserved working YouTube backup/tag and do not rewrite player interception based on stale reports.

Disney+ observations and voluntary local blocked-request exports were collected on the same date:

| Session | What the owner observed | What the export establishes |
| --- | --- | --- |
| Logged-in Disney+ landing page | Signed in and browsing, not playing a video | **49** blocked third-party background requests, mostly EasyPrivacy; not a video ad test. |
| Disney+ movie | Movie viewing with ads appearing to be blocked | **20** blocked network requests; one EasyList hit on `us-east-2.ads.digital.disneyadvertising.com` using `||disneyadvertising.com^`. |
| Disney+, CSI: Las Vegas | Owner reported ad blocking working during this program | **22** blocked network requests; one EasyList hit on the same Disney advertising hostname. |

The two Disney+ playback-session reports are **separate exports**, not cumulative measurements of all browsing or proof that 20 or 22 video advertisements would have played. Their `playbackDiagnostics` arrays are empty, so the exports do not independently confirm a playable video or absence of on-screen ad breaks. The ad-blocking outcome comes from the owner's visual observation; the report independently verifies the listed request blocks. The private full exports were supplied to the development conversation and were **not added to the public repository**.

**Regression baseline for future builds:** Preserve owner-observed working advertising suppression on ordinary YouTube videos, YouTube "Free with Ads" films, Disney+ films and CSI: Las Vegas, and 1337x unsolicited advertising tabs. Do not loosen filters or change YouTube/Disney+ player paths as an unsubstantiated repair. Compare future changes against this documented working behavior; continue the separate seven-phase offline suite, long-playback checks, and authorized release review. Exact extension commit/version is not embedded in the site exports and is therefore not independently established by those JSON files.


## Manual Firefox observation: The Pirate Bay ad and popup suppression (November 1, 2026)

**Status: PASS for owner-observed behavior on the tested `thepiratebay.org` page; not a full popup-policy acceptance.** The owner compared the site with DK Live Block protection off versus on: an advertising overlay/card (screenshot showed a blue lower-right offer) was visible with protection off, while the same class of advertisements disappeared with protection on. The owner also observed that unwanted new advertising windows/tabs stopped opening when DK Live Block was enabled. This real-browser observation is the evidence for visible ad and unwanted-window suppression; the exported network log independently establishes only actual request blocks.

**Blocked report:** Local export on 2026-11-01 at `17:02:02.735Z`, site `thepiratebay.org`, hybrid backend, **9 blocked requests** (all 9 retained). Breakdown: **7 EasyList**, **2 EasyPrivacy**; **6 scripts** and **3 images**. Destination/count breakdown: `unhappyweakness.com` (2 scripts, EasyList rule `||unhappyweakness.com^`); `d9r4lqt28t1fm.cloudfront.net` (2 scripts, EasyList hostname rule); `torrindex.net` (3 images, EasyList matched-pattern details withheld to protect URL privacy); `static.cloudflareinsights.com` (2 scripts, EasyPrivacy). The disabled-state screenshot displayed a browser network status transferring data from `unhappyweakness.com`; it does not establish the specific cause of popup behavior.

**Permitted report:** Separate local export on 2026-11-01 at `17:02:23.338Z` shows **normal protection active**, **7 completed requests** across **5 hostname/resource-type groups**. These comprise `thepiratebay.org` (image 1, scripts 2), `apibay.org` (XHR 2), `cdn.jsdelivr.net` (script 1) and `torrindex.net` (script 1). A permitted `torrindex.net` script and blocked `torrindex.net` images are consistent with resource-type/path-specific filtering, not an indiscriminate block of the host. Permitted does not mean independently verified safe.

**Privacy and interpretation:** The owner shared the original screenshot and two exports in the development conversation; the raw reports and screenshot are **not published** to the repository. Neither report contains a popup closure event, and neither independently establishes the exact popup guard that acted. Keep this positive user-observed browser result as a regression baseline alongside 1337x, YouTube, and Disney+ tests. Preserve permitted site functions, explicit user-requested windows, and existing strict-site protections in subsequent builds. The report format does not identify a precise extension build SHA.

## 2026-11-01: real browser preroll test, **FAIL before Build 222 retest**

Owner screenshot: an actual skippable preroll video promotion was visible before the requested playback on `www.xnxx.com`; DK toolbar showed protection on, zero blocked and 46 permitted requests, and offered to *allowlist* (not already allowlisted) the website. User exported `dk-live-block-www.xnxx.com-all-permitted-2026-11-01T18-12-58-457Z.txt`. Report header: normal protection active, request logging true, 46 completed permitted, nine hostname/resource groups, zero saved selective blocks. Note: no blocked export was provided, but the visible toolbar already showed zero.

Observed permitted groups relevant to triage: `hls-cdn77.xnxx-cdn.com` (4 XHR), `mp4-cdn77.xnxx-cdn.com` (1 media), `thumb-cdn77.xnxx-cdn.com` (16 images, 8 XHR), `s.ltnktuzzjq.com` (7 XHR), `n2j9y0x0.bxcdn.net` (1 media). An untrusted URL's request classification must not be inferred as confirmed advertising from these host/type observations alone; investigate the likely external ad-video CDN first. Build 222 adds one exact-host+resource-type+site filter only for the separately hosted media; it does not block the site's ordinary content CDNs or speculative XHR destinations.

**Still to test on the actual updated Firefox add-on:** installed version `0.3.192` (rather than an older development copy), page and same video freshly reloaded, blocked count after the external media request, success/failure of preroll, normal content playback and seek controls, no extra network errors, and any remaining on-page/sidebar advertising. If the preroll persists, collect the updated detailed per-request report or Firefox Network Monitor, not a made-up match. Do not promote this site as an advertised README success.

## November 1, 2026: Disney+ CSI: Las Vegas A/B advertising test, owner-observed PASS

The owner tested the same show in Firefox with DK Live Block **disabled**, observed advertisements, then **reenabled** DK Live Block and reported those advertisements were removed. This is direct user-observed OFF/ON comparison evidence, not merely a count of blocked network requests. The owner also reported that mid-play advertising appeared to be blocked during Disney+ viewing. Preserve this known-working behavior.

The exact extension version/commit, count of ad breaks, independent video/player diagnostics and network-to-visual causality were not provided. **Do not generalize to guaranteed ad removal on every Disney+ show or every midroll.** A new release acceptance pass should check normal playback, seeking, subtitles, fullscreen and continued ad suppression. Keep all site-level QA outcomes in docs, not the root README.


## November 1, 2026: CBS News article playback and ad observation

The owner reported no visible advertising on CBS News in the tested session, but observed a sidebar video on a `www.cbsnews.com/news/...` article start playing without a deliberate click. The owner also reported the Firefox right-click **Block element with DK Live Block** command selects an object but does not hide it when chosen. Preserve the current apparently successful CBS network blocking and Patreon link. New acceptance checks: reload a normal CBS article and confirm the sidebar video remains paused until clicked; explicitly click Play and confirm playback works; open an unrelated site and YouTube/Disney+ to confirm no autoplay control leaks. Block a harmless article sidebar element, confirm immediate disappearance and persistence after reload; Undo the rule and confirm visibility returns. No Firefox test was run at code-commit time.


## November 1, 2026: owner CBS News and element-picker results (Build 227)

The owner tested Build 227 in Firefox and verified that the right-click Block Element picker actually hides the selected element, including after reloading. However, this persistence was unwanted for the picker: the owner accidentally hid the CBS video player while testing, and explicitly requested that a **normal webpage reload restore manually picked elements**. Build 228 changes *new* picker selections to in-document hiding only. Previously stored cosmetic rules from the old picker require using the existing popup Undo hide control to remove the saved rule once.

CBS News article video autoplay was successfully prevented by Build 227. However, a deliberate Play click left the player in an infinite spinner. Build 228 releases the page's player after a trusted player-control click, including clicking a video overlay and a replaced video element. This is a hypothesis-driven change; owner Firefox testing is still required.

The owner also compared CBS News with DK Live Block disabled vs enabled: disabling revealed extensive advertising and an endlessly scrolling ad feed; re-enabling produced a much more usable article. Treat this as *owner-observed successful CBS advertising suppression*. Do not weaken network filters in an autoplay fix.


## Owner CBS homepage report (November 1, 2026)

Owner screenshot shows CBS News main homepage player on the right is black and cannot play with DK Live Block active. CBS article player previously stopped autoplay but became stuck after pressing Play. Owner requires manual Block Element hiding to reset on refresh and never save automatically; Build 227 stored CBS-specific CSS picker rules permanently. Build 229 removes those old CBS rules, removes new picker persistence paths, preserves the one CBS video configuration host identified in the blocked request report, and protects CBS player containers from cosmetic list rules. The owner previously observed CBS with many advertisements when the extension was off and usable with those advertisements suppressed when on. **Build 229 was not yet owner-tested in Firefox**; no claim of fixed video playback or store readiness.

Build 229 follow-up acceptance: check the CBS News homepage video does **not** autoplay and **does** load after user Play, along with the article page case.

## Owner browser acceptance update (November 1, 2026, Build 232 / 0.3.202)

- **XNXX: PASS (owner-reported).** Owner explicitly accepted the tested site after Build 232, including the previously reported premium-promotion and sidebar-ad issue. This is a site-specific acceptance, not an assurance for all videos or future site variants.
- **Facebook: FAIL (owner screenshot).** A feed post marked `Ad` (Dawn of Jets) and two advertisements under the right-hand `Sponsored` heading remained visible while DK Live Block was active. The Build 232 Facebook detector therefore cannot be called complete. Owner priority: fix feed and right rail without hiding legitimate posts, groups, navigation, or contacts. Reels acceptance remains open.
- **CBS News: PROVISIONAL.** Owner reported playback working and could not reproduce a subsequent stall, but extended playback across breaks remains due for retesting.
- **YouTube, Disney+, 1337x, The Pirate Bay:** user-observed success remains recorded; do not regress these working paths. These observations are not comprehensive parity tests.

**Evidence scope:** Reports and screenshots are owner browser observations, not a complete independently executed acceptance matrix or a current Linux regression run.

## Build 233 Facebook acceptance gate (0.3.203, November 1, 2026)

The owner previously documented sponsored advertisements in the Facebook feed and right-side Sponsored module with DK Live Block active. Build 233 adds Facebook-only detection fixes, but **no live browser PASS has been recorded** for the new source. With DK enabled, refresh Facebook, inspect normal feed scrolling and both sidebar ads, then inspect Reels and Marketplace separately. Confirm that genuine posts, contacts, groups, forms and navigation remain usable; disabled/enabled or site-exception changes must restore hidden content correctly. Record any surviving ad with a cropped screenshot and label/menu information but do not share private account content or login tokens. A blocked-request counter is not a measurement of cosmetic post hiding.

The previously exported Facebook permitted-request report showed normal protection active with 490 completed requests, and many first-party Facebook background and fbcdn image/script requests were permitted. Hostname-level permitted events cannot establish which specific feed entries were advertisements. Do not turn the entire Facebook GraphQL, image or script hosts into block rules. No personal logs or account-specific URLs are stored in the repository.

## Build 234 (0.3.204): Facebook acceptance and comparison

Owner acceptance remains **OPEN**. Test normal Facebook feed and right rail at the current extension version. Side-by-side compare against uBlock Origin on the same Firefox profile setup and page/account (with only one blocker enabled at a time). Confirm right-side advertisers identified by `rhcad2`, attribution registration, and campaign fingerprints disappear when DK Live Block is enabled. Confirm ordinary links, legitimate posts, login, contacts, group pages and Messenger remain intact. Screenshot-level observations do not prove exact DOM attributes. Avoid exporting personal post contents.

Automated coverage added for the advertised attribute signatures, ordinary links, right-column geometry, restoration and short split-label performance. Full Ubuntu suite not run by the assistant, and no Firefox browser PASS is asserted.

## Build 235 (0.3.205) Facebook acceptance
New code detects ads referenced through separate ARIA and SVG sprite labels, including some labels Facebook removes. The ten focused JavaScript cases passed in isolation; live Facebook and the full Ubuntu suite are unverified. Owner should check the main feed, right Sponsored column, ordinary posts and contacts. No private content is exported in these tests.

## Build 236 (0.3.206) optional Ad Investigator acceptance (owner pending)

With a normal Firefox tab and DK Live Block active, open the toolbar and choose **Investigate missed ad · Local AI assist**. Hover and click a surviving ad. A local panel should show ad evidence, the limitations of its synthetic score and any element-hiding exception, without automatically hiding the item or saving rules. Choose **Hide this page item** only if you intend to hide it; use the existing popup **Undo hide** to restore it, or reload. **Copy draft rule** should appear only when a stable, unique, narrow ad-slot selector exists. Close or press Escape to cancel. Test ordinary posts, Messenger, navigation, forms, dialogs and YouTube/Disney+ playback to ensure the feature is passive until invoked. Confirm no private data is transmitted. The six isolated tests (including 64 model combinations) passed, but live Firefox acceptance remains pending. Facebook Build 235 protections are still awaiting owner retest.

## Build 238 / v0.3.208: Facebook automatic feed recognition (live Firefox pending)

Reproduction from the owner's Facebook screenshots: the Ad Investigator recognized a Best Friends Animal Society sponsored post with **Strong advertising evidence · score 0.90** because Facebook explicitly labeled the post menu as sponsored content, yet the automatic blocker left the feed item visible. Earlier Uber feed ads and right-column Sponsored placements also survived. The evidence score is synthetic and is NOT a calibrated probability or proof automatic filtering executed.

**Retest sequence:** update/reload the current extension, refresh Facebook, and check whether full Sponsored feed cards disappear **without opening the investigator**. Separately verify the right-hand Sponsored section and ordinary feed articles, contacts, Reels, Messenger, groups, navigation and comments. If a post remains, inspect it with the draggable built-in investigator and capture the findings; a label-only manual Block element action is NOT equivalent to automatic card removal. Automatic ad recognition must remain enabled for the site. Do not infer cosmetic hiding from the blocked-network counter.

Source regression fixture covers the same sponsored-menu signal with trailing whitespace, missing article markers, exception changes, ordinary text and long-feed scans. Fifteen focused tests passed in isolated JS; full Linux runner and actual Firefox remain OPEN. No private account data saved by tests.

## Build 239 / 0.3.209 owner acceptance (NOT YET RUN)
- **Popup:** In the Firefox toolbar verify the original DK emblem is followed by LIVE BLOCK (not DK LIVE BLOCK). Primary operations cyan, inspection/navigation white, reversible or pause actions black. Check approved popup geometry, buttons, tooltip and keyboard focus. Protection has a cyan-on/dark-off sliding switch.
- **Ad Investigator:** Open on Facebook only by explicit owner click. Drag title out of the Sponsored label, click a suspected advertisement, inspect bounded DOM tag/role hierarchy and matching eligible cosmetic rules. Outline must not hide. Cosmetic match is not proof a hide applied. Repeated selection should keep window position and site exceptions. Manual hide/undo/draft remain distinct from automatic filtering.
- **Network/controls:** Use investigator links to open the existing DK Network Monitor, Site Dashboard and cosmetic debugger. Start capture voluntarily; third-party grouped destination counts come only from its in-memory records. Inspect a row, test Allow and Block switches individually (cyan ON, dark OFF), with confirmation, failure rollback, keyboard access and restoration. Do not broadly block sign-in or video resources.
- **Compatibility:** Recheck Google sign-in/account creation on NBCUniversal in Firefox and legitimate payment/pop-up dialogs. Confirm ordinary YouTube and Disney+ playback and current site exceptions. Facebook automatic feed and right-side sponsored ads remain independent acceptance items.
- **Chrome/Edge:** Packaging plan is source-only; no Chrome/Edge production package or behavior verified. Their MV3 network and background adapters must be implemented and tested before enabling output. Normal Firefox tests still required.

## Build 240 / 0.3.210 owner visual check (pending)
In Firefox, open Site Dashboard after updating existing extension. Scroll both permitted-request Block toggles and blocked-request Allow toggles. Each switch should show a normal-width, **48px track** with compact thumb and separate action label, not a long stretched horizontal bar. Check long CDN names, small window widths and keyboard Tab/Space interaction. Turning controls on/off must still ask for the existing confirmation when appropriate, honor scope, and roll back failures. Network Monitor and popup protection switch should retain their existing dimensions. The screenshot of oversized controls is a confirmed Build 239 CSS issue; Build 240 is awaiting live verification.


## Owner report: recurring adblock detection on ordinary YouTube videos (November 3, 2026)

**Status: OWNER-REPORTED REGRESSION, UNRESOLVED.** The owner reports that YouTube once again recognizes DK Live Block while watching **a regular video**. They expressly distinguish this from the YouTube movie catalog labeled **Free with Ads**. Do not mark the movies as failing, retested or unaffected based on that distinction alone. The earlier November 1 real-browser success on ordinary YouTube videos remains a historical result, now superseded for the reported ordinary-video case by a newer regression report.

The precise text, player state, installed DK revision, Firefox build, full URL and active experiment mode are currently unknown. No real browser reproduction or targeted fix has been verified. Source-history inspection shows the key player-response and MAIN-world page bridge sources last changed November 1, before Builds 288–295, but that alone cannot determine whether server enforcement, list updates, account treatment, browser changes, or another extension caused detection.

**Evidence required when owner chooses to test:** screenshot of the warning or sanitized YouTube compatibility export. Distinguish a dismissible overlay from an in-player playback refusal. Record whether ordinary video actually plays, whether ad media appeared, and whether "Free with Ads" movies work independently. Avoid private URLs, IDs, accounts or cookies in published notes. Do not indiscriminately hide enforcement dialogs or bypass video health safeguards. Preserve the last known working YouTube source tag.


## Screenshot confirmation and Build 296 diagnostic readiness (November 3, 2026)

The owner provided a Firefox/YouTube screenshot showing an **ordinary video** stopped by YouTube's full in-player Terms of Service adblock warning, explicitly stating that playback is blocked. The message is part of the player view, not a dismissible popup. The report is a confirmed owner-visible **regression**, not yet a proven cause in DK Live Block. The previously working Free with Ads movie category has not been retested as part of this screenshot. Do not add the screenshot's video/channel details or other private browsing information to the repository.

Build 296 adds only a bounded read-only player-text diagnostic that can emit the existing `enforcement` playback-health event without exposing DOM text. Browser testing after installation remains necessary. The previously existing Site Dashboard `Export YouTube diagnostics (.json)` report is the next evidence needed; it may contain browser/request details that should be reviewed and sanitized before sharing. For a controlled comparison use the existing temporary per-tab response-only, bridge-only and observe modes with one regular video and reloads. **Observe mode leaves network filters enabled.** Avoid masking the warning or claiming a fix until ordinary videos actually play again.

## Build 297: optional YouTube player API isolation test (November 3, 2026)

The new diagnostic mode `player-pass-through` is owner-confirmed and one-tab only. It disables both player JSON rewriting methods and selectively preserves three first-party YouTube player API paths. It does not allowlist the whole website, disable third-party advertising filters, change media URLs or suppress in-player enforcement. Unlike "Observe only," essential player JSON calls can bypass subscription blocking. This is an investigatory A/B variation, **not a confirmed fix**, and may expose player advertising metadata.

When the owner chooses to test, choose the same ordinary video, compare one mode at a time with a reload after applying it, note visible playback and any advertisement, and obtain a sanitized YouTube diagnostic report. Restore "Normal (both methods)" afterward. Independently retest YouTube Free with Ads movies later, without treating historical success as current verification.

## November 3, 2026: Facebook missed feed ad and Build 298 candidate
The owner supplied two Firefox screenshots of an ordinary Facebook feed displaying a verified blue-check advertiser post with the **Ad** marker near the linked account name. DK Live Block was enabled in the popup, but an experimental setting did not hide that post; 0 blocked network requests and 503 permitted were displayed in this one tab. **This is a documented DOM-level miss**, not proof that permitted requests were safe or all ads. Build 298 extends the explicit Ad-byline recognizer to nested linked-author headers and deep non-landmark feed cards with bounded, reversible hides. The existing screenshot is not an HTML fixture; synthetic tests cannot confirm live Facebook effectiveness. Check an ordinary post directly adjacent to the ad, scrolling performance, Marketplace, chat, menus and the detector's count-only status before declaring success.

The owner also requested removal of the public site's mismatched brown banner-style backgrounds and a main-page Back to top button. Build 298 changes the Russian presentation's brown tones to dark charcoal while retaining the approved metallic banner image and fixed black/gold/white/red button order; the new main-page control is separate from modal controls, uses black/cyan styling, has bilingual text, remains hidden until scrolled and honors reduced motion. Site visual acceptance remains pending.
