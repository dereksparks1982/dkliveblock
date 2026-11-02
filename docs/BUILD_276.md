# Build 276 / v0.3.246: Russian-language presentation

**Historical note:** Build 276 initially introduced `assets/images/ДК Лайв Блок_ Ваши правила.png`. The owner later rejected and deleted that artwork. Build 278 replaces it with the newly approved simple red/gold/black banner, `assets/images/Metallic Cyrillic Emblem and Gold Live Block Title.png`. Do not restore the former banner. The English banner remains `assets/images/DK Live Block Neon Banner.png`.

## GitHub Pages

- A compact language selector appears in its own upper-right strip, not over approved artwork.
- Initial visit reads `navigator.languages` for Russian preference (no geolocation or IP checks); later manual choice in `localStorage.dkWebsiteLanguage` overrides it.
- Same one-page site; all existing sections, four-button grid, informational dialogs, destinations, and mechanics preserved.
- Russian mode replaces the banner, site title, meta description, all user-facing static text and accessibility labels with bundled Cyrillic strings; theme switches to red, gold and steel. English mode restores original text/art/theme in the same session.
- Each source text fragment is keyed by its stable local hash. The site never sends its locale, content or settings to a translation service. Adding English text requires adding a Russian translation and running coverage tests.
- The download and repository URLs are unchanged. This feature does not automatically enable Russian filter subscriptions.

## Extension integration

The website and extension cannot directly share local storage due to distinct security origins. The extension's own dropdown remains the source of its selected language. A common visual standard and easy, independent control provide equivalent use without new server tracking.

## Verification

Local source and translation coverage should be checked before acceptance. No assertion of actual Firefox/GitHub Pages render until explicitly tested.

## Website reliability and documentation corrections

- Removed a write to the frozen localization API that aborted all twelve card-dialog click handlers. Retained the language-change event listener and card-height recalc.
- User-approved final card colors: the *former hover fill* is now the resting fill in both English (`#14404b`) and Russian (`#60262a`), while hover and focus still highlight the border. No changes to card geometry or dialog behaviors.
- Russian hero buttons use black, gold, white/steel, red in their existing order, with allowed text wrapping and original target URLs.
- Replaced README with a short feature/usage summary and added separate `README.ru.md`; build notes remain in `docs/` only.
- Eliminated the obsolete `docs/index.html` mirror and its duplicated page-only assets. The root `index.html` is the sole maintained website source, with a regression test to prevent mirror drift. GitHub Pages settings still need independent verification for deployment acceptance.
