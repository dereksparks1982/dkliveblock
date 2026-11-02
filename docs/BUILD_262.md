# Build 262 · v0.3.232: deeper Facebook MIT integration and test-contract repair

## Facebook DOM integration

Extends DK Live Block's existing `src/facebook-ads.js`; no independent upstream extension is loaded.

1. **Nested sponsored-label decoding.** Added a bounded (maximum four levels, 48 character spans) CSS-order-aware decoder, adapted conceptually from the vendored MIT Facebook blocker. It handles Facebook's nested character-span wrappers and both short- and long-class decoy partitions. Malformed wrappers fail closed. The original fast flat-span path remains authoritative.
2. **Multi-post guard.** An explicitly marked article can still be a wrapper containing two separate child posts. Before any post-level hide, detect multiple substantial sibling article/pagelet children; reject that parent rather than losing neighboring organic posts. Generic `aria-posinset` descendants alone do not count as distinct posts.
3. **React-recycled hidden cards.** When a hidden post's DOM changes, mark only its nearest hidden ancestor dirty. After a grace period, re-evaluate explicit advertising labels/attribution links. If evidence is absent on two spaced checks, restore original display style and release the hidden-card slot. If explicit evidence survives, keep the ad hidden. No raw post text, URL or Facebook profile information is logged.
4. **Batched performance behavior.** Dirty marking walks at most 32 ancestors, not all hidden cards. No added always-on polling, new browser permissions, remote dependencies or wider network interception. The extension's existing periodic scanner performs the second confirmation. Recycled-card restoration and review counts are exposed in the existing aggregate Facebook diagnostics.

## Release verification fixes

- Synced `package.json` from stale `0.3.210` to manifest `0.3.232` to honor the repository's existing version-contract tests. No dependency or build script changes.
- Removed hardcoded historical manifest-version assertions from eight older feature tests. They now compare the Firefox manifest to the current package version, preserving behavior assertions across releases.
- Added `tests/facebook-build262.test.js`, with six focused cases for nested labels, organic-decoy rejection, two-post wrappers, delayed restoration of recycled organic posts, persistence of genuinely sponsored posts, and preservation of the vendored MIT module's inactive status.
- Executed both the Build 261 and Build 262 JavaScript fixtures in an isolated evaluation environment: **13/13 passed**. This was *not* the full Node suite and *not* a live Firefox Facebook test. Local runtime attempted to reach GitHub to fetch the complete repository but could not resolve github.com. The connected GitHub integration was used for source-level checks and commits.

## Preserved scope

- No changes to DK Live Block's YouTube, Disney+, CBS, streaming, cookie controls, Russian language preferences, or approved UI geometry.
- No new GitHub Actions, CI branch, automatic telemetry, credentials, ad allowlist, external runtime engine, or wholesale extension replacement.
- The public DK website continues to link only Hanafi Learning Deck, Folkhold and Capital & Consequence; Nougat Media Plus remains excluded.
- Existing site exceptions, per-item manual choices, and revert-on-pause semantics remain in force.

## Still not complete / acceptance

- First-party Facebook GraphQL/JSONL response filtering is a **separate** engine-level task, requiring real response fixtures and strict schema-based edits. Do not naively remove every `sponsored_data` field from arbitrary responses: it can break GraphQL shape and site interactions.
- Real Firefox scroll, Marketplace, mobile, feed/right rail, Contacts, Messenger and post-recycle acceptance remains pending.
- The full offline `scripts/test-local.sh` suite must pass before an accepted release; isolated checks alone are insufficient.
