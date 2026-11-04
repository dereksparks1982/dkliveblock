# Build 342: protecting active Facebook editing

**Version:** 0.3.312. **Status:** source-only, unreleased.

The existing desktop post guard refuses active textbox and composer descendants, but the separate Marketplace tile and mobile virtualized-post resolvers lacked the equivalent protection. Both now refuse contenteditable=true, textbox, searchbox, textarea and nonhidden input descendants without relaxing original exact advertisement evidence, post geometry or user exceptions. A promoted item with an active editor can remain visible until no editor is present, a conservative user-input safety tradeoff.

Also removes the final historic-version assertion found in the 70-case isolated integration run and registers five focused tests in the source audit. Native Ubuntu suite, real Firefox/Orion and ad-removal acceptance remain pending.
