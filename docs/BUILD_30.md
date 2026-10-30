# Build 30: local video privacy reset

**Version 0.3.1, unreleased.**

The My Saved Videos page exposes **Erase saved-video history** with confirmation. Erase clears the saved-video collection, local auto-save throttling state and last download status, and turns off opt-in automatic YouTube remembering. This prevents the list from immediately repopulating. Downloaded media files are left alone. Active downloads block erasure until they finish or the user cancels them.

Library writes are serialized through the existing local queue. The UI displays whether automatic remembering is currently enabled. No new account, telemetry, permission or external dependency.

Real Firefox integration, complete offline regression suite, YouTube/Disney+ playback and ABP parity remain release gates.
