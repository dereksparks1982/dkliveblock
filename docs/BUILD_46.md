# DK Live Block Build 46: Allowed Websites

**Version 0.3.17 · UNRELEASED Firefox source.**

First feature of the next sequential parity pass: site allowlisting.

- Rename the toolbar's ambiguous **Pause on site** control to **Allowlist this website**, switching to **Remove from allowlist** when allowed.
- Keep the existing `settings.paused` list as the only persistent source of truth, preserving user-saved paused domains.
- In Settings, provide a dedicated Allowed Websites section: add a hostname or pasted HTTP(S) website URL, see saved hostnames, and remove individual sites. The existing manual textarea stays available for advanced edits and Save Settings.
- Normalize pasted URLs to the canonical lowercase hostname; do not store URL paths, query strings, credentials, cookies or tokens. Reject malformed hostnames and non-HTTP(S) schemes.
- A hostname exception covers the hostname and subdomains. Removing an inherited allowance when visiting a subdomain also removes parent entries that covered it.
- Require an actual live HTTP(S) browser tab for the one-click toolbar action instead of accepting a spoofed tab URL in a message; page content scripts cannot manage global site exceptions.
- Maximum 500 entries, no automatic allowlisting, no paid/acceptable ad exceptions or promotional messages.

**Caution:** Full-site allowlisting disables DK Live Block's blocking on that site; it is distinct from per-host and per-resource-type temporary allowances. Saved sites are not restored to protected status until a user removes them.

**Pending tests:** full Node/Python suite, real Firefox UI/subdomain/restart tests, no public release.
