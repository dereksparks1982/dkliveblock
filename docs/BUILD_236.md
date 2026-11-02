# DK Live Block Build 236 / version 0.3.206

**Scope:** AI-assisted ad investigation after Facebook Build 235, on the existing main branch. No GitHub Actions, additional branches, temporary projects or installation copies.

## New behavior
1. Extend `src/adaptive-model.js` **without changing its existing YouTube recommendation model**, adding a separate experimental ad-evidence scoring interface. The ranking model is trained on 64 synthetic examples, not collected browsing data. A numerical score is not a calibrated ad probability.
2. Add `src/ad-investigation.js`: local, bounded candidate selection and evidence extraction from known ad slots, Facebook sponsor menus, explainer links, sidebar ad fingerprints, author bylines and protected-context indicators. Reuse existing ad-recognition logic, honor element-hiding exceptions and avoid collecting full post bodies.
3. Add `src/ad-investigation-ui.js`: opt-in on-page hover-and-click investigator with local explanation, evidence score, temporary manual hiding, undo, and copyable draft rule only for a unique narrow structural ad slot. Never run automatic blocking from model output.
4. Add a new popup button and integrate Undo with the investigator's page-only hide stack. The overlay is never injected until the owner explicitly requests it.
5. Load the local model and both investigator modules in the normal content-script chain, alongside the existing background AI. No additional permissions, cloud dependencies, download package, or network endpoints.
6. Document reproducible synthetic model training in `scripts/train-ad-evidence-model.py` and add `tests/ad-investigation.test.js`.

## Verification
- Six focused JavaScript tests passed in an isolated execution harness, including exhaustive 64 synthetic evidence combinations, negative/ambiguous selectors, protected areas, local exception reporting and manifest load-order checks.
- All files are committed to current `main`, based on Build 235. The full Ubuntu seven-phase regression suite has **not** been run here, and no real Firefox result is claimed.
- A separate real-browser Facebook comparison is still required: check the main-feed advertising post, right-sidebar Sponsored module, and ordinary Facebook UI. Facebook is NOT labeled PASS. This build intentionally does **not** alter automatic Facebook ad filtering.

## Next acceptance
Update the existing local DK Live Block checkout/installation directly, then reload the extension and Facebook page in Firefox. Test auto-filtering first. Use Ad Investigator manually only if Facebook still displays sponsored content, and report any failure or overblocking. No temporary folders, duplicate checkouts or GitHub Actions.
