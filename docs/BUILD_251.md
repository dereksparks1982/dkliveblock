# Build 251 · v0.3.221: direct MIT Facebook blocker source review

## What was incorporated
- Added the full upstream `content.js` from Inky's MIT-licensed `browseraddonsupport-wq/fb-sponsored-ad-post-blocker` (upstream manifest checked at version 1.1.97) to `src/vendor/facebook-sponsored-upstream.js`.
- Included its exact MIT license as `src/vendor/LICENSE-FACEBOOK-SPONSORED-MIT.txt`. DK's earlier adapter had already incorporated and credited selected techniques in `src/facebook-ads.js`; this source addition makes deeper comparison reproducible and auditable.
- Reviewed upstream label reconstruction (invisible Unicode, CSS order, false characters), standalone scan / mutation machinery, post traversal and right-rail classification.
- Reviewed uBlock Origin `uAssets/filters/quick-fixes.txt`: active Facebook GraphQL `json-prune`, `json-edit` and `jsonl-edit-xhr-response` rules. These are filter syntax for uBlock's engine and not executable DK code without compatible scriptlets. uAssets is GPL-3.0, **not MIT**. Do not mix this license up with Inky's MIT project.

## Why simply loading 140 KB is unsafe
The upstream Facebook project is a *standalone extension*. Its content script initializes immediately, installs its own MutationObservers, sends messages to its own background script, uses its own `browser.storage.local` setting keys, inserts UI markers and defaults to hiding suggested and unfollowed posts and unlabeled ad-like posts. DK's existing module, settings, site pauses, exceptions, UI and Ad Investigator are different. Running both unmodified could duplicate hides or remove normal content without the owner's consent.

The source is **vendored and available for source-level integration** but deliberately **not listed in manifest content_scripts** and is not running yet. It is not accurate to claim that copying it alone repairs Facebook.

## Integration sequence
1. Extract/adapt the upstream explicit Sponsored/Ad label and whole-post methods under DK's existing scoped Meta adapter, not as a competing standalone extension.
2. Exclude upstream suggested/unfollowed/shape-only removal unless explicitly requested and safety-tested.
3. Use DK's enabled, per-site pause, exceptions and restoration controls. No new permissions or remote dependencies.
4. Test against user screenshot (visible `Ad` feed byline and `Sponsored` right rail), synthetic adversarial DOM cases and Firefox live feed. Ensure organic posts and contacts remain.
5. Use uBlock's *ideas* for GraphQL-level filtering only after studying Firefox response-stream safety and licensing; do not transplant GPL code without ensuring licensing compatibility.

**Status:** Source vendored, not activated. Facebook acceptance still FAIL as observed by owner on Build 250. Do not issue a success claim.
