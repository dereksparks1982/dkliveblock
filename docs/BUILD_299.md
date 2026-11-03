# Build 299 — Russian extension UI coverage and cyan notice styling
Date: November 3, 2026
Version: 0.3.269
Status: source incorporated into main; not yet accepted in live Firefox, not released.

## Owner report
Selecting Russian in the Firefox extension left much of the interface in English. The brown development warning in Settings did not fit the established dark/cyan extension UI. The website localization is a separate implementation and does not translate extension pages.

## Implementation
- Expanded the existing exact-match, locally bundled Russian catalog in `src/ui-language.js` for Settings, the toolbar popup's experimental controls, and Site Dashboard. No remote translation, language detection by geo-IP, telemetry, or changes to network blocking.
- The Site Dashboard now loads the same language module and follows `dkUiLanguage` in Firefox local storage even without its own language dropdown.
- Localized select-option labels, retaining option values so protection/test modes behave identically in English and Russian.
- Replaced brown backgrounds on the Settings development notice and popup playback-repair notice with charcoal and cyan while retaining the approved layout.
- Registered `tests/ui-language-build299.test.js` in the offline Ubuntu test runner. The new test catches newly introduced untranslated static text fragments.

## Measured static-text coverage
- Settings: 204 unique English fragments; 200 translated and 4 intentional exceptions (DK LIVE BLOCK, Patreon, a Linux directory, support email).
- Toolbar popup: 63 fragments; 61 translated and 2 intentional brand exceptions (LIVE BLOCK, Patreon).
- Site Dashboard: 86 fragments; 85 translated and the DK LIVE BLOCK brand intentionally unchanged.
- The coverage measure is based on distinct source-HTML text fragments, not user-visible words, translated runtime status output, or a claim of native-speaker review.

## Focused verification
- Compilation of the production localization JavaScript and new Node test source in an isolated V8 evaluator: passed.
- Exact dictionary coverage checks for those three source HTML pages: passed.
- Synthetic DOM text translation English -> Russian -> English: passed.
- Manifest and package version equality: passed.
- Approved settings-group count remains eight; dark warning styling verified.
- Complete Ubuntu offline test runner: **not run**.
- Live Firefox desktop/mobile visual and accessibility tests: **not run**.

## Known limitations / next passes
- Other extension tool pages (Network Monitor, library, downloads, report, forensic screens, YouTube lab, etc.) do not yet load the language module; their static and dynamically generated strings require separate review and translation. Therefore do not claim DK Live Block is fully localized.
- Russian layout length/line wrapping and screen readers require live testing.
- Facebook ads and ordinary YouTube video anti-blocker regression remain separate urgent issues; no changes to filtering or video transport in this build.

## Acceptance
Do not mark the Russian extension experience complete until the owner visually checks Settings, popup, and Site Dashboard after installing the candidate. Public release remains subject to project verification and owner approval.
