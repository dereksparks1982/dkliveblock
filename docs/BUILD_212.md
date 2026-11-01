# Build 212: strict popup clock rollback and temporary grant validation

**Unreleased development version:** 0.3.182. **Preserved observed-working YouTube rollback:** Build 203 at `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## Defect

`popupTrapClaimActive` previously used only `Date.now() - claim.when <= CLAIM_MS`. A negative difference after system clock rollback satisfied this condition, causing a future-dated or invalid strict popunder claim to remain authorized to cancel navigation in the newly created tab. The one-time approved-tab map similarly stored only an expiration time, so a rollback could extend the approval window.

## Changes

- `src/popup-trap.js` now has `claimActive()`, `allowTab()`, `tabAllowed()` and `permitActive()` with safe integer checks, lower and upper time bounds, source/tab identity checks, bounded map retention and invalid-state eviction. Approved new tabs retain a start time and expiration, rather than an expiration-only number.
- `src/background.js` uses these helpers wherever it blocks claimed popunder navigations, recognizes an explicitly allowed tab, issues a consumed approval, or shows one-time permit status.
- Three additions to `tests/popup-trap.test.js` exercise rollback, expiration edge, malformed claim, invalid approval, overflow and status consistency. All nine focused popup guard tests passed in an isolated JS runner.

## Safety and remaining checks

- This does not enable strict popup blocking on more sites or change existing site allowlists, source-tab revalidation, login protection, popup history sanitation, the user-facing permit button, extension permissions, YouTube filtering or interface geometry.
- In-memory grant schema changes are not persisted and do not require migration after an extension background restart.
- Full Node/Ubuntu suite, existing popup integration tests, and live Firefox tests have **not** run in this remote build. Verify these before accepting this source for use over Build 203.
