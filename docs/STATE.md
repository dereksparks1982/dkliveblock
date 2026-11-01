# DK Live Block: current engineering state

**Source snapshot: Build 161 / 0.3.131 (2026-10-31), unreleased.**
This document describes verified repository state and missing acceptance evidence; it is not a parity claim.

## Implemented source
- Firefox MV2 extension with bundled Ghostery 2.20.3 plus native filtering, filter-list subscriptions, content hiding, user/site exceptions, popup defenses, network inspection and locally exported blocked/allowed request summaries.
- Site-level cosmetic exceptions now govern supplementary Ghostery CSS (Build 159) and automatic DOM ad-slot recognition (Build 160).
- Build 161 fixes three independent-review test fixtures, keeps an explicit per-phase offline test inventory, and adds a seven-phase fail-collecting local runner.

## Outstanding evidence / known risks
- **Offline suite**: complete current Build 161 Node/Python suite has not been executed and accepted. The historical complete pass belonged to Build 63. The independent Build 158 review found 690/693 Node cases passed and three fixtures failed.
- **Engine correctness**: the current hybrid matcher is native-first and may block requests before the bundled Ghostery matcher evaluates a matching exception that DK's parser rejected. No production arbitration change has been made.
- **YouTube**: existing first-party JSON transformations, page bridge and Skip Ad assistant have not passed real Firefox anti-adblock, preroll, midroll, ad-supported film and ordinary-video playback acceptance. No evidence of reliable ad-free playback is claimed.
- **Security and distribution**: complete permissions/privacy and Linux native-companion audit, long-session performance measurements, Mozilla signing and owner-approved release remain open.

## Next milestones and gates
1. Run **all seven offline phases** at exact Build 161 HEAD, resolve any remaining failures, record evidence.
2. Build 162: native/Ghostery verdict observatory and controlled differential fixtures. Avoid changing production request behavior until proven.
3. Build 163: correct subscription verdict arbitration while preserving explicit DK policy.
4. Instrument and test YouTube with a clean, controlled Firefox matrix, then implement fixes supported by observed results.
5. Security, performance, competitor benchmarks, final acceptance and Mozilla review.

No GitHub Actions, hosted CI, automatic deployments, external filtering engine installations or public download packages are authorized.
