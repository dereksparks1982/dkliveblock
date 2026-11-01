# Build 188: accurate verdict accounting for bundled Ghostery redirects

**Unreleased source:** 0.3.158, 2026-11-01.

## Confirmed diagnostic bug
Build 178 introduced tightly constrained, extension-owned inert Ghostery redirect execution. The older `scripts/engine-verdict-audit.js` from Build 162 nonetheless classified **every** Ghostery redirect as `vendor_redirect_unsupported`, even if DK had selected the built-in local `redirect/noop.js` or `redirect/empty.css` replacement. That overstated a remaining feature gap and undermined future comparison work.

## Change
- Audit the actual *production verdict* as well as native/Ghostery parser verdicts; accept only a final applied `source:"ghostery-safe-redirect"` with `block:true` and the two audited resource names as a `vendor_vetted_redirect_applied` category.
- Keep unknown, non-executable and unapproved redirect resources in `vendor_redirect_unsupported`; do not load any additional script, use data URLs, expand trusted sources or change production filtering.
- Add an explicit boolean `vettedLocalRedirect` to the synthetic decision record, never a source URL or rule text.
- Replace misleading `redirect-unavailable` fixture with separate, named approved and unsupported redirect cases.
- Extend `tests/engine-verdict-audit.test.js` to check both categories and verify that no browsing URL, origin or filter source leaks in the synthetic output.

## Verification
Executed the **actual bundled Ghostery parser and DK hybrid matcher** in isolated V8: `redirect=noop.js` on a script returned a locally applied vetted redirect, while `redirect=unknown-resource.js` remained unsupported. The updated audit evaluated all **13 synthetic cases** and separated both categories accurately. Changed JS and regression syntax passed.

This is an **offline audit correction**. Production block/allow, browser UI, video playback, privacy permissions and filter lists are unchanged. Full seven-phase Linux suite and live Firefox/YouTube comparative testing remain outstanding. Do not claim parity.

**Next: Build 189:** use accurately classified audit outcomes to identify the highest-impact remaining unsupported filter semantics or playback failure based on observed evidence. No GitHub Actions, public release or terminal tasks for the owner.
