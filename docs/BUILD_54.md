# Build 54: safe cookie rejection and engaged-dialog protection

**Version 0.3.25 · UNRELEASED source**

This build hardens the existing optional cookie-consent rejector and default-on distraction suppressor. It adds no external dependencies, permissions, network calls, promotional messages, or browser-wide exceptions.

## Changes

- Require every non-empty visible button text, `aria-label`, and `title` to match an explicit rejection choice. A contradictory or unrelated label makes the action ambiguous and prevents clicking.
- Reject navigational link-like elements, form-submit buttons, and aria-pressed toggles instead of treating their visible text as a safe consent action.
- Skip disabled, inert, hidden, invisible, zero-opacity or pointer-events-disabled buttons, and verify that `.click()` exists.
- Add a small number of unambiguous English rejection choices. Existing localized labels are preserved; unknown labels remain untouched.
- For newsletter and survey cleanup, do not hide a dialog when the current focus belongs to an input, textarea, select, or editable field within it. No form values or user-entered content are inspected.
- Retain previous per-site exceptions, bounded scanning, reversible overlay recovery, and ad/tracker filtering. No auto-accept fallback exists.

## Remaining acceptance

Run `bash scripts/test-local.sh` in a complete local checkout (not run in this environment) plus real Firefox checks on multiple cookie-management interfaces, newsletter forms, login, checkout, media and cross-origin frames. Check that accessibility labels are trustworthy and use the site's own opt-out flow when a reject button is absent.

**No GitHub Actions, no download, no release; not a claim of Adblock Plus Premium parity.**
