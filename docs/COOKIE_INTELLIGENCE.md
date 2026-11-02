# Cookie Intelligence and Control Center · design and staged implementation

**Requested by owner, November 1, 2026.** A user-controlled cookie firewall, with per-cookie **Allow / Block** toggles, records of observed cookie-setting attempts, who appears to own the cookie provider, what it does, and why it was allowed or blocked.

## Distinguish these three features
1. **Cookie-consent UI rejection (existing):** DK currently finds certain cookie notices and clicks the website's own Reject/necessary-only control. This does NOT guarantee the website was prevented from creating a cookie.
2. **Network anti-tracking (existing):** Filter lists may block requests from trackers, indirectly preventing their response cookies. The existing request monitor audits network decisions, not all cookie-setting attempts.
3. **Per-cookie firewall (planned):** Separate controlled inspection and enforcement for individual cookie names, domains and site contexts.

## Desired controls
- Separate **Cookie Intelligence** page; no redesign of approved DK dashboard geometry.
- A row for each observed cookie with hostname, name, path, expiration/session, Secure, HttpOnly, SameSite, partitioned/first-party context where available, cookie source and creation/update/blocked status.
- **Allow** and **Block** toggles, individually scoped by *site + cookie domain + cookie name*. Allow decisions never defeat existing phishing protections or explicitly user-blocked network requests. No unrequested blanket allowlisting.
- Temporary/session-only overrides, remembered decisions, reset/revoke controls and confirmation before deleting stored cookies. Preserve first-party login cookies by default.
- Attempt history should distinguish HTTP Set-Cookie, JS-created cookies, and *currently stored* cookies; a cookie's presence does not prove what created it. Browser limitations, privacy settings, and extensions may prevent complete observation.
- Purpose categories: essential authentication, preferences, analytics, attribution, advertising/tracking and **unknown**. All start unknown until independently evidenced. Ownership must be evidence-based through explicit provider investigation, not a registrar name guessed to be the operator.
- Retain no cookie **values**, session IDs, raw request headers, full URLs, passwords or private account content in logs or exports. User can clear investigation history and decision rules separately.

## Agent Nesty registry (Build 258)
The owner-approved singular brand is **Agent Nesty**. Each watcher has a permanent, extension-local identifier:
- `agent_nesty_1`: HTTP response `Set-Cookie` watcher, currently armed when request logging is enabled.
- `agent_nesty_2`: Firefox cookie-change watcher, defined but not yet armed.
- `agent_nesty_3`: JavaScript cookie-write watcher, defined but not yet armed.

Agents stay dormant until their specific events occur; an observed cookie-setting attempt is **not** proof of acceptance or blocking. The active watcher records no cookie values. The current viewer is accessible through the existing Site Dashboard under **Agent Nesty · Cookie Watch**.

## Technical implementation sequence
1. **Build 256:** Pure, bounded cookie metadata sanitizer and site-specific decision model in `src/cookie-intelligence.js`. No browser.cookie API, automatic interception or UI toggles yet, so do not describe this as working cookie blocking.
2. Add Firefox `cookies` API access only when controls and capability notice are ready; inspect same-site cookies and onChanged events. Avoid enumerating unrelated browser cookies on a page and honor privacy/partition keys.
3. Add narrow HTTP `Set-Cookie` attempt detection only when the existing request-monitor opt-in is active; never store values or entire headers. Do not confuse cookie deletion after creation with genuine prevention of creation.
4. Enforce explicit blocked cookie rules safely at response-header and applicable browser-cookie boundaries, while respecting Firefox restrictions and login compatibility. A rule may be ineffective if the browser never exposes the attempt: say so.
5. Add the separate GUI with per-row controls, exception scope, verified owner/purpose evidence, method, disposition, observed frequency and clear/export functions.
6. Regression-test Facebook/Meta, Google login, YouTube/Disney+/CBS playback, shopping, auth redirects, first/third-party and partitioned cookies; no global change to cookie behavior until opt-in and validation.

## Non-negotiable
- Existing `cookieReject` behavior and settings are preserved. Turning this new feature on must not silently delete existing cookies.
- DK is not an ad-tech tracking service: all records are local and eraseable; permissions are minimal and behavior is explicit.
- No hidden owner inference, auto-uploaded cookies, new Git branches, GitHub Actions, or surprise UI geometry changes.

**Current status:** Design approved in conversation; only source-side sanitizer and pure decision model are implemented. Enforcement, persistence, browser event hooks, GUI toggles, ownership verification and full Linux/Firefox testing are not implemented.
