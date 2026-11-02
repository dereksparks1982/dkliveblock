# Build 237 / version 0.3.207

**Scope:** User-requested draggable investigator window on the existing main branch.

The Ad Investigator instruction and result panels have a focusable title bar. Holding the primary mouse button on the bar and dragging moves the panel and keeps it within the Firefox viewport, away from page advertisements. Arrow keys move a focused handle by 12 CSS pixels; Shift+Arrow by 40. Results retain the same panel position. Pointer event handlers are removed on release, cancel and closure.

The owner confirmed right-click **Block element with DK Live Block** removed a Sponsored label that was inaccessible beneath the instruction panel. This does not mean the surrounding advertisement was automatically removed. Facebook automatic blocking is still a FAIL and this release does not attempt to change it.

The existing inspector test module is now registered in the seven-phase Ubuntu runner, and a drag/lifecycle source regression was added. This code was syntax-checked before commit; full local Ubuntu execution and real Firefox interaction acceptance have not been run in this environment. No additional branches, Actions, download copies, new permissions, permanent rule changes, or edits to unrelated website designs.
