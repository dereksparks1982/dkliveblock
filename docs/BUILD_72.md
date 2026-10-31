# Build 72: restore background integration test coverage

Unreleased 0.3.42 (2026-10-31). The user’s Ubuntu local run for 0.3.41 completed 169/169 extension-structure tests and 321/332 offline regression tests. Eleven offline regression failures were startup errors with the same immediate cause: `DKRuleProvenance` was missing in four independently maintained Node VM script lists, although `src/manifest.json` already loaded the new module.

## Change

- Make auth, generic background, proxy/network and YouTube-pack integration VMs load `src/manifest.json` background scripts in the production order. This automatically includes bundled, local modules as they are added without manually updating every test fixture.
- Provide `TextEncoder` in the YouTube VM, matching the other Firefox background VM fixtures.
- Add a manifest contract test for the four fixtures, guard against hardcoded background script arrays and ensure the current rule-evidence and activity dependencies are packaged.
- Keep the existing local-only `scripts/test-local.sh` verification gate. No CI workflows or external build services.

## Verification and scope

The root cause is proven by the provided error trace and inspection of the repository source. This change was committed by direct repository edit, not by executing the complete Ubuntu Node/Python suite in this session. Run `bash scripts/test-local.sh` locally after pulling to verify whether any further behavioral failures emerge. Do not describe 332/332 green tests, completed YouTube advertising removal, or signed Firefox release until actually confirmed.

No runtime blocking policy, network behavior, extension permissions or UI layout is changed. No download package is published.
