# Build 259 · v0.3.229: Russian interface language controls

Owner language priorities: English baseline, **Russian first**, then Arabic, Turkish, Urdu, and Persian/Farsi as one language. No Hebrew, Spanish, Greek or French translation currently planned.

## Shipped in repository source
- `src/ui-language.js`: small local dictionary and exact-text DOM localization engine with English fallback.
- Popup and Options/Settings language selectors now offer **English** and **Русский**; the selection is persisted under `dkUiLanguage` in `browser.storage.local`, independent of existing protection settings.
- Existing **Language-specific filter lists** remain an unrelated feature. Switching interface language does not download new lists, grant site exceptions or change blocking.
- Russian translations cover common popup labels/actions and top-level Settings headings; the selector openly warns that untranslated strings remain English.
- Future languages are documented but not exposed as non-functional select options.
- No new permissions, remote translation service, backend requests, background polling, native dependency, GitHub Actions or UI rearrangement.

## Verification and limitations
JavaScript syntax check and isolated translation smoke test passed: a test text node changed from 'View blocked' to Russian and restored to English, with the document language updated. A Node regression fixture was committed. Full Ubuntu test suite, Firefox interaction testing, bilingual proofreading, and complete UI translation have **not** been performed.

Facebook live ad-blocking acceptance is still pending. Agent Nesty cookie watchers remain at their Build 258 state.
