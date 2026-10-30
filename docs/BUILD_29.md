# Build 29: organize saved videos

**Version 0.3.0, UNRELEASED source.**

Saved videos can now be marked favorite, watched/unwatched and annotated with a private note up to 500 characters. Search includes notes, and library filters show all, unfinished, watched or favorite videos. Records remain constrained to canonical YouTube IDs and the existing local 300-entry cap. All user-provided text is inserted through DOM textContent, not HTML.

Manual saves and opt-in automatic progress updates preserve existing favorites, watched markers and notes. Imports and exports carry these properties. No new permissions, outbound telemetry or account.

Acceptance remains: full local tests; real Firefox interaction, export/import, video playback and addon security review; YouTube/Disney+ tests; ABP parity; explicit release authorization.
