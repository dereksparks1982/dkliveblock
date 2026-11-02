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
- No interface localization is injected into websites. The localization engine loads only in the popup and Options pages.

## Coverage limitations
This is the **first Russian localization slice**, not a fully verified translation. Main popup labels/actions and Settings headings are translated. Complex dynamic feedback, verbose Settings descriptions, secondary tools (dashboard, agent viewers, network monitor), and error strings may remain English. Do not claim full Russian support until a UI text audit and Firefox acceptance pass.

## Follow-up quality gates
- Verify persistence of Russian setting across Firefox restart and synchronization between popup and Settings.
- Audit and translate all remaining settings descriptions, system messages and named UI tools.
- Verify handling of longer Russian labels and responsive widths without changing user-approved layout geometry.
- Review translation with a fluent Russian speaker, retain English fallback, and protect actual domain/rule values from translation.
- Add next target languages only once translations and LTR/RTL behavior are genuinely implemented, without exposing nonworking choices.

## Source of the Agent Nesty nickname
The numbered agent code is a distinct internal feature. The YouTube creator publicly goes by **Anastasia | Agent Nesty** and describes the brand as an agent-themed community. We have **not** confirmed the origin of the nickname or an alleged spy accusation. Nothing in localization depends on that story.
