# DK Live Block interface localization

## Language priority (owner direction, 2026-11-01)
1. English, the original/default interface.
2. **Russian (Русский), first translation target.**
3. Arabic (العربية), planned.
4. Turkish (Türkçe), planned.
5. Urdu (اردو), planned.
6. Persian / Farsi (فارسی), planned as **one** language (`fa`), not two translations.

Hebrew, Spanish, Greek, and French are not in the current localization plan. This is a project-scoped selection of languages, not a restriction on using DK Live Block.

## Build 259 implementation
- Both the Firefox toolbar popup and Options/Settings now contain the **Interface language** select control.
- English (`en`) and Russian (`ru`) are the only selectable interface languages.
- The choice is stored locally as `dkUiLanguage` using Firefox `browser.storage.local`; change events synchronize the currently open extension interfaces. The saved selection survives Firefox restarts.
- Existing filter subscriptions and their separate **Language-specific filter lists** setting are **not** modified by a UI language change.
- Strings are translated by a local `src/ui-language.js` dictionary; no remote translator, internet service, telemetry, or added permissions.
- The translator preserves elements and attributes and rewrites only exact-known text nodes, including dynamically added popup strings. English is the fallback if a translation is missing or a locale is unsupported.
- The interface remains left-to-right for Russian and English. Arabic, Urdu and Persian will need separate right-to-left QA before activation.
- No interface localization is injected into websites. The localization engine loads in the popup, Options, and Site Dashboard pages.

## Build 299 (November 3, 2026): extension-wide priority and coverage
- Owner found that the Settings page looked mostly English despite choosing Русский. Audit identified 204 distinct static English text fragments on the Settings page, only 46 initially translated. The Site Dashboard had 86 fragments and only 4 translated, and did not load the language module.
- Build 299 expands the explicit Russian dictionary to cover the visible text on these two pages and the toolbar popup. Proper names, product branding, executable paths, and support addresses remain unchanged. Both dropdown choices use their translated labels while retaining their original option values.
- The Site Dashboard reads the existing saved interface-language choice without requiring an additional selector. Switching to Russian never changes network rules, website locale or browser language.
- Added offline regression coverage of all static text fragments in the three pages. This does not validate runtime-generated JavaScript status strings or other extension utility pages. Full offline suite and live Firefox visual testing are still pending.
- The Settings development warning now uses charcoal/cyan rather than brown; other approved controls and geometry are untouched.

## Coverage limitations
This is the **first Russian localization slice**, not a fully verified translation. Main popup labels/actions and Settings headings are translated. Complex dynamic feedback, verbose Settings descriptions, secondary tools (dashboard, agent viewers, network monitor), and error strings may remain English. Do not claim full Russian support until a UI text audit and Firefox acceptance pass.

## Russian user disclosures (November 2, 2026)
- Russian README now links to the accessible [Russian user notice](NOTICE_RU.md), including explicit voluntary proxy routing and local privacy explanations.
- Optional network settings heading now uses **Proxy Settings / Сетевые настройки DK / Прокси**, not circumvention-promoting language. The network feature itself is unchanged and disabled by default.
- Russian regulatory diligence is tracked separately in [regional compliance review](REGIONAL_COMPLIANCE_RUSSIA.md). These documents do not establish full Russian-language UI coverage or legal sign-off.

## Follow-up quality gates
- Verify persistence of Russian setting across Firefox restart and synchronization between popup and Settings.
- Audit and translate all remaining settings descriptions, system messages and named UI tools.
- Verify handling of longer Russian labels and responsive widths without changing user-approved layout geometry.
- Review translation with a fluent Russian speaker, retain English fallback, and protect actual domain/rule values from translation.
- Add next target languages only once translations and LTR/RTL behavior are genuinely implemented, without exposing nonworking choices.

## Source of the Agent Nesty nickname
The numbered agent code is a distinct internal feature. The YouTube creator publicly goes by **Anastasia | Agent Nesty** and describes the brand as an agent-themed community. We have **not** confirmed the origin of the nickname or an alleged spy accusation. Nothing in localization depends on that story.

## Build 300: utility and safety screens
The video library, downloads, voluntary support form and phishing warning now load an exact-match Russian utility string catalog before the existing translator. Both dictionaries remain local and do not translate websites, hostnames, user-entered report text or backend decisions. Full Firefox visual and language QA are outstanding.

## Build 301: network and YouTube diagnostics
Network Monitor and the offline YouTube diagnostic comparison lab now use the local utility translation catalog. The chosen interface language does not alter captured traffic, blocked-request history, experiment values, file contents, browser language, or YouTube video state. Dynamic feedback and responsive Russian label layout still need real Firefox testing.

## Build 302: Nesty and inspection screens
Meta intelligence, Nesty Cookie Watch, cosmetic debugging and the optional Firefox Developer Tools panel use the local Russian utility dictionary. Dynamic diagnostics remain partly English, and the Orion-only popup has a separate capability path.

## Build 303: essential runtime integration correction
Builds 300–302 had valid extra string dictionaries, but the DOM text/attribute rewriter still checked only the earlier Settings dictionary. Build 303 fixes the integration, adds safe placeholder translation, and watches a bounded whitelist of changing UI attributes. Tested with an isolated synthetic DOM; real Firefox acceptance remains required.

## Build 304: known dynamic messages
Fixed runtime messages produced by the support form, library, downloads, phishing warning, Network Monitor and YouTube lab have exact local Russian translations. Strings that include hostnames, user notes, numeric counters or arbitrary errors do not receive broad pattern substitutions, avoiding corruption of private data or misleading labels. Translation remains partial until native Firefox visual QA and all dynamic messages are reviewed.

## Build 396 public Russian language consistency (November 12, 2026)

The Russian README again uses the exact owner-approved Cyrillic red/gold metallic banner. The website now loads that same published local PNG first and the immutable GitHub revision only if the local file fails. Its early hero initialization sets the Cyrillic banner before the rest of the site content; its language selector says «Язык» and «Английский» in Russian mode, restoring the original English controls when switched back. Existing translated site body text uses Russian technical/vendor terms, preserving actual URLs, account addresses and setup paths. Regression checks cover the binary asset hash, localized text completeness and switch reversibility. The English website and geometry are unchanged.
