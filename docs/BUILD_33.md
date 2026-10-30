# Build 33: temporary evidence-based streaming repair

**Version 0.3.4, UNRELEASED source.**

A manually selected blocked hostname and resource type from the YouTube/Disney+ diagnostic page can now be allowed in the current tab for ten minutes after a prominent confirmation warning. Only previously observed blocked `media`, `xmlhttprequest` or `other` requests are eligible. The exact hostname and type are allowed, never scripts or all hostnames by wildcard. This could still allow advertisements on that host and is not proof of an existing playback failure.

Each tab has at most ten active entries, in memory only. Entries expire after ten minutes and are removed on tab close, leaving the streaming host, disabling temporary request logs, statistics reset or explicit Revoke. Reloads on the same streaming host preserve the short-lived allowance for testing. The toolbar shows a warning while a repair is active. No automatic allow decisions or new permissions.

**Outstanding:** full local suite and actual Firefox acceptance, including YouTube preroll/midroll, Disney+ playback, streaming diagnostics accuracy, ABP parity, signed companion installer and explicit release authorization.
