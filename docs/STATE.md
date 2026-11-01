# DK Live Block: current engineering state

**Source snapshot: Build 174 / 0.3.144 (2026-10-31), unreleased.**
This document describes verified repository state and missing acceptance evidence; it is not a parity claim.

## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 corrected three identified test fixtures. Build 162 adds bounded synthetic native/Ghostery/hybrid verdict comparison, and registers the previously omitted runner self-test. No production blocking rule changes.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 174 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
- **Engine correctness**: Build 163 now consults Ghostery exceptions before enforcing ordinary native subscription blocks. Other precedence, unsupported syntax, important rules and real-browser compatibility remain unverified.
- **YouTube**: Build 167 records coarse first-load bootstrap observations. Build 168 adds a temporary YouTube test switchboard that separates response filtering, page-bridge filtering and observe-only diagnostics, without changing the default combined behavior. Existing first-party JSON transformations, page bridge and Skip Ad assistant have not passed real Firefox anti-adblock, preroll, midroll, ad-supported film and ordinary-video playback acceptance. No evidence of reliable ad-free playback is claimed.
- **Security and distribution**: complete permissions/privacy and Linux native-companion audit, long-session performance measurements, Mozilla signing and owner-approved release remain open.

## Next milestones and gates
1. Run **all seven offline phases** at exact Build 174 HEAD, resolve any remaining failures, record evidence.
2. Build 162 differential observatory implemented; full Ubuntu execution remains pending.
3. Build 163: exception-rescue and manual precedence changes landed; additional differential/browser verification needed.
4. Instrument and test YouTube with a clean, controlled Firefox matrix, then implement fixes supported by observed results.
5. Security, performance, competitor benchmarks, final acceptance and Mozilla review.

No GitHub Actions, hosted CI, automatic deployments, external filtering engine installations or public download packages are authorized.

## Build 169 blocked-event controls
The current Site Dashboard now exposes confirmed, reversible remembered site + destination-hostname + request-type Allow switches for retained blocked requests. These are **not individual URL controls**. Popup restrictions and manual selective blocks remain separate. Live Firefox, YouTube and full local test acceptance remain outstanding.

## Build 170 unified YouTube observation export
The ordinary blocked-request TXT/JSON now includes coarse response/body counts, configured temporary experiment mode and at most four first-load bootstrap observations when the selected site is YouTube. This is a user-triggered local report, not a change to response interception. An empty playback-health list does not mean ads were removed. Regular-video anti-adblock behavior still needs controlled Firefox comparison with the movie-playback baseline.

## Build 171 packaged source audit
A new offline source asset-closure checker has been validated against the GitHub tree: 87 referenced packaged assets, 10 HTML pages, zero missing. A regression test is registered as Node test file #117. Full seven-phase Linux suite and live Firefox acceptance still remain unverified.

## Build 172 filter compatibility
Added explicit-site literal-only :matches-attr procedural cosmetics, including precise exception matching. Arbitrary regex attribute matching, scriptlets and HTML response filtering remain unsupported. Targeted JavaScript source smoke passed, but the full suite and live browser validation remain pending.

## Build 173 report accuracy
Current exact host/type Allow/Block choices appear beside historical blocked events in locally exported TXT/JSON reports. This is a reporting improvement only; prior observations remain historic, and full browser/Node/Python acceptance remains open.

## Build 174 request authorization and settings safety
Foreign URL-bearing no-tab messages no longer enter the privileged message flow. All rejecting subscription and website-exception validators run before settings mutations. Regression coverage now includes persistence failure rollback for a remembered blocked-event Allow choice. The full Linux test suite, Firefox behavior and broader permission audit remain unverified.
