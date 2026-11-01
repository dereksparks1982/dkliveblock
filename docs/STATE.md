# DK Live Block: current engineering state

**Source snapshot: Build 169 / 0.3.139 (2026-10-31), unreleased.**
This document describes verified repository state and missing acceptance evidence; it is not a parity claim.

## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 corrected three identified test fixtures. Build 162 adds bounded synthetic native/Ghostery/hybrid verdict comparison, and registers the previously omitted runner self-test. No production blocking rule changes.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 169 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
- **Engine correctness**: Build 163 now consults Ghostery exceptions before enforcing ordinary native subscription blocks. Other precedence, unsupported syntax, important rules and real-browser compatibility remain unverified.
- **YouTube**: Build 167 records coarse first-load bootstrap observations. Build 168 adds a temporary YouTube test switchboard that separates response filtering, page-bridge filtering and observe-only diagnostics, without changing the default combined behavior. Existing first-party JSON transformations, page bridge and Skip Ad assistant have not passed real Firefox anti-adblock, preroll, midroll, ad-supported film and ordinary-video playback acceptance. No evidence of reliable ad-free playback is claimed.
- **Security and distribution**: complete permissions/privacy and Linux native-companion audit, long-session performance measurements, Mozilla signing and owner-approved release remain open.

## Next milestones and gates
1. Run **all seven offline phases** at exact Build 169 HEAD, resolve any remaining failures, record evidence.
2. Build 162 differential observatory implemented; full Ubuntu execution remains pending.
3. Build 163: exception-rescue and manual precedence changes landed; additional differential/browser verification needed.
4. Instrument and test YouTube with a clean, controlled Firefox matrix, then implement fixes supported by observed results.
5. Security, performance, competitor benchmarks, final acceptance and Mozilla review.

No GitHub Actions, hosted CI, automatic deployments, external filtering engine installations or public download packages are authorized.

## Build 169 blocked-event controls
The current Site Dashboard now exposes confirmed, reversible remembered site + destination-hostname + request-type Allow switches for retained blocked requests. These are **not individual URL controls**. Popup restrictions and manual selective blocks remain separate. Live Firefox, YouTube and full local test acceptance remain outstanding.
