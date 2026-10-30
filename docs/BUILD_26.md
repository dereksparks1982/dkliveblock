# DK Live Block Build 26: video library usability and backups

**Version:** 0.2.7. **Status:** internal, unreleased.

Implemented: local-only search over saved titles and canonical video IDs; newest/oldest/title sorting; explicit JSON export (no upload); guarded 750 KB import with strict record validation and merge/cap; confirmed clear of saved videos; and removal confirmation remains per-entry intentional click. This does not delete downloaded video files.

All backup data is stored locally through the existing browser.storage.local namespace. Imported records do not execute code or fetch URLs; allowed YouTube hosts and video IDs are validated.

**Still required:** full local repository suite, real Firefox tests of the settings, popup and library, YouTube preroll/midroll and Disney+ playback testing, ABP parity and explicit release approval. No public package.
