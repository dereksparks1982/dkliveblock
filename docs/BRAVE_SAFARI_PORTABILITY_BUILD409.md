# Build 409: Brave offline engine differential and Safari / Orion portability

**Status: developer-only source and synthetic fixtures committed. Not an installed Brave engine, a signed Safari extension, an Orion extension, or Firefox browser acceptance.** Existing blocking decision paths are unchanged.

## Upstream actually reused

- Brave [adblock-rust](https://github.com/brave/adblock-rust), MPL-2.0, official Rust crate pinned to **adblock 0.13.5** (October 28, 2026), not an unlicensed copy. Optional Cargo code at experiments/brave-differential/ calls FilterSet, Engine::new_with_filter_set, Request::new, Engine::check_network_request and FilterSet::into_content_blocking directly.
- Reuse the **existing** scripts/engine-verdict-audit.js cases and bundled native/Ghostery/hybrid comparison. The new JS adapter only sends synthetic cases to Brave, validates schema/IDs and merges ID-only verdicts.
- The adapter rejects unknown fields, mismatched versions, duplicates and missing case IDs. It keeps intentional DK policy exclusions separate from parity and never echoes user browsing URLs or rule bodies in its reports.
- Cargo dependencies are **not** in root npm, manifest, Firefox bundle, website, or a user runtime. No Brave source is copied into this repository. First Cargo dependency retrieval requires explicit approval. Audit third-party transitive notices before distributing compiled artifacts.

## Reproduce on a development Ubuntu machine

Run the no-install Node safety tests and create the deterministic synthetic corpus:

    node --test tests/brave-portability-build409.test.js
    npm run audit:brave:corpus > /tmp/dk-brave-corpus.json

Only if you explicitly choose to compile the upstream Rust crate and have reviewed dependencies:

    cargo run --release --manifest-path experiments/brave-differential/Cargo.toml < /tmp/dk-brave-corpus.json > /tmp/dk-brave-verdicts.json
    npm run audit:brave -- /tmp/dk-brave-verdicts.json

Brave's official engine supplies the verdicts. Results are comparison evidence, **not** proof that DK blocks live ads on Facebook or YouTube.

For Brave's official **Apple content-blocker JSON** conversion path, not the unrelated Safari WebExtension DNR format:

    npm run audit:brave:safari-corpus > /tmp/dk-safari-input.json
    cargo run --release --manifest-path experiments/brave-differential/Cargo.toml < /tmp/dk-safari-input.json > /tmp/dk-safari-content-blocker.json
    npm run audit:brave:safari-report -- /tmp/dk-safari-content-blocker.json

The converted JSON uses synthetic .example rules. The JS report validates and summarizes it. It is not a public release artifact. Safari still needs Xcode and a signed containing app for its static content blocker.

An offline Cargo run is possible with cargo --offline run when a previously reviewed crate registry is already cached. Rust resolution is deliberately **not** part of automatic npm test:local. The Node regression tests are.

## Browser capability boundary

| Mechanism | Current Firefox MV2 | Safari content blocker | Safari WebExtension DNR | Orion iOS |
| --- | --- | --- | --- | --- |
| Cancel request from listener | Existing webRequestBlocking | Not applicable: declarative JSON triggers | DNR declarative rules plus permissions | **Unverified** on device |
| Rewrite first-party response body | Supported by eligible Firefox filterResponseData | Not expressible in JSON | Not equivalent to Firefox response filtering | **Unverified** |
| Complete DOM Facebook scanner | MIT detector with current safety policy | Cannot execute in static rule list | Separately packaged content script may be possible | **Unverified** |
| Rule conversion | No need | Brave content-blocking converter | Needs a different DNR-specific converter | Cannot assume it installs |
| Popup / tab / playback diagnostics | Firefox adapters | Not reproduced by static rules | Needs permissioned adapters | Unverified |
| Distribution | Unsigned developer XPI | Host app/Xcode signing | Separate Safari extension packaging | Must verify real Orion capability |

Safari static content blocker JSON (trigger/action) is **not** Safari WebExtension declarativeNetRequest JSON (id/priority/action/condition). The Brave converter outputs only the former. Apple's [Safari content blocker guide](https://developer.apple.com/documentation/safariservices/creating-a-content-blocker) and [Safari WebExtension DNR guide](https://developer.apple.com/documentation/safariservices/blocking-content-with-your-safari-web-extension) describe distinct mechanisms. Neither establishes what Orion iOS actually supports.

## Acceptance ledger and next

1. **Done in source:** official Brave Rust API harness, Apple converter call, bounded synthetic input, strict privacy-preserving comparison and conversion validators, tests, scripts and license documentation.
2. **Still pending:** Native Rust/Cargo build, real Brave verdict report, generated reviewed Cargo.lock, transitive dependency review, actual compiled Safari rule validation, Xcode signing, Orion iOS capability and behavior tests.
3. **No automatic runtime adoption:** only consider importing a narrowly demonstrated improvement after exception/policy tests, license review, live Firefox regression and explicit owner acceptance.
4. **Next is Build 410:** offline supervised Nesty evaluation only with approved labeled data, separate site holdout, high precision/low false-positive targets and rollback. No browsing-data auto-training.

Source references reviewed November 13, 2026: [Brave engine](https://github.com/brave/adblock-rust/blob/master/src/engine.rs), [Brave converter](https://github.com/brave/adblock-rust/blob/master/src/lists.rs), [Brave license](https://github.com/brave/adblock-rust/blob/master/LICENSE), [Apple content blocker API](https://developer.apple.com/documentation/safariservices/creating-a-content-blocker), [Apple Safari DNR API](https://developer.apple.com/documentation/safariservices/blocking-content-with-your-safari-web-extension).
