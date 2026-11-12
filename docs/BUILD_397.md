# Build 397 / v0.3.357: Linux regression stabilization and vendor budget protection

**November 12, 2026.** Internal development on main, no public release.

## Confirmed test-runner mismatch
The project runner now executes eight phases following the reviewed third-party source license gate from Build 394. Its older self-tests still asserted seven and the mocked Node program rejected the existing `third-party-license-gate.js` and `nesty-evidence-lab.js` programs. Build 397 corrects all three discrepancies without removing or relaxing any actual verification phase.

## Ghostery work bound
The MPL-licensed Ghostery cosmetic bridge previously allowed 200 fragments of up to 500,000 characters, as much as 100 million characters processed in one call. The new aggregate limit is 2,000,000 characters and 4,000 CSS blocks. Previously admitted safe rules remain in the result, while later work is discarded at budget exhaustion. The normal 300-selector ceiling, streaming fail-open policy, user exceptions, and prohibitions on scripts/remote redirects are unchanged.

A targeted integration command, `npm run test:integration`, exercises the newest Facebook, Ghostery, localization, provenance and runner fixtures without installing any dependencies or opening a browser.

**Validation:** Syntax and direct semantic smoke checks were possible in an isolated JavaScript runtime. The complete Ubuntu suite was not run here; external Firefox/Facebook/YouTube acceptance remains pending.
