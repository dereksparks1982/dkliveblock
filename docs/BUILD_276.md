# Build 276 / v0.3.246: Russian-language presentation

The user approved a specific USSR-themed Russian banner, `assets/images/ДК Лайв Блок_ Ваши правила.png`. **Do not redraw or replace it.** The English banner remains `assets/images/DK Live Block Neon Banner.png`.

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
