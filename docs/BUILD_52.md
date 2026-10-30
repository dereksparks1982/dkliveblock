# DK Live Block Build 52: individual cosmetic filter exceptions

**Version 0.3.23 · UNRELEASED source.**

## Changes

- From the existing cosmetic debugger, choose a matching cosmetic CSS selector and explicitly confirm **Stop hiding on this site**.
- Adds an exact-site `hostname#@#selector` user rule to the same custom filter text already parsed by DK Live Block. A matching network ad remains blocked; this is not a paid, site-wide or network-request allowance.
- The debugger lists its own user-added per-site cosmetic exceptions and provides individual **Restore hiding** buttons, with confirmation. No silent changes.
- Live tab hostname is fetched again by the background. The current page must be an active, protected HTTP(S) tab. Background actions from page/content scripts are denied.
- A strict selector parser and 240-character selector limit reject malformed CSS, scriptlet formats, newlines and rule injection. Per-site limit: 500 exceptions; total existing custom-rule text cap remains one million characters.
- Redundant additions remain idempotent. Removing one exception leaves all other user rules, blocking rules and exceptions unchanged.
- The debug outline scanner examines at most 160 candidate DOM nodes per manual request and outlines at most 12 visible nodes, restoring previous inline outline styles when cleared.

## Outstanding

- Real Firefox acceptance: showing/hiding a hidden banner after reload, exact-host scoping, native/hybrid filter engine behavior, manual custom rule synchronization, browser history and SPA transitions.
- Full offline Node/Python suite, security review and remaining Adblock Plus features are not yet proven.
- No GitHub Actions, download, installer, compiled package or public release.
