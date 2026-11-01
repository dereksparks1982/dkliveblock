# Build 198: fix NUL-list validation and sanitize exported engine names

**Unreleased:** 0.3.168, 2026-11-01.

The list-refresh guard now rejects actual NUL bytes, not the escaped text sequence; corrected Build 197 fixture newline escapes. The YouTube export limits filterBackend to the known native/hybrid labels, eliminating another untrusted output field. Focused actual module assertions passed.

V8 source syntax and direct guard assertions passed. Full Linux seven-phase suite and real browser outcome comparisons remain unrun. No Actions, public release or user terminal tasks.
