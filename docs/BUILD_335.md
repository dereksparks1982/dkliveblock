# Build 335: protect Facebook inline editing

**Version:** 0.3.305. **Status:** source-only, unreleased.

A Facebook feed card may contain an active comment editor or embedded composer even if it also contains an ad-looking marker. Previously the `safeCard` guard excluded editing ancestors but not editing descendants. The feed hide now refuses cards containing textareas, textboxes, searchboxes, contenteditable=true regions or visible inputs. Existing sponsored evidence, article bounds and general detection remain unchanged for cards without editors.

Five source/fast-path cases cover text input, editor groups, regular Sponsored still hiding, dialogs and unchanged Firefox permissions. Full Ubuntu and live Firefox verification still pending. This is a deliberate safety-first false-negative trade-off when a Sponsored post contains an active editor.
