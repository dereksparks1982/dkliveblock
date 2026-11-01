# Build 217 · Threat warning interstitial (development source only)

**Version:** 0.3.187 · **Date:** November 1, 2026 · **Status:** Not owner-accepted, not published.

## Scope and intent

Users encountering a hostname on the locally cached Phishing Army feed should see clear, publisher-attributed context instead of a blank failed navigation. The warning must not turn a false-positive possibility into a statement of established guilt or identity. It must not turn a hostile page into an extension-privileged actor.

## Implemented

- A new packaged `blocked.html` warning, local CSS/JavaScript and manifest resource registration.
- Only exact-host, main-frame HTTP(S) GET phishing matches redirect to the warning. Subresources and non-GET matches remain cancelled. The original ad-filter and YouTube code paths are unchanged.
- Cryptographically random 128-bit, one-tab, three-minute warning grants live only in background memory. Nothing stores or displays the original URL path, query string or fragment. The warning fragment contains the nonce only.
- The warning displays the exact hostname, feed publisher/category, locally cached feed date, source policy link and meaningful false-positive caveats. All dynamic fields use textContent.
- A deliberately checked risk acknowledgement is required before a persistent *exact-host* override is saved using the existing threat override system. The page navigates to `https://<exact-host>/`, never a replay of the blocked URL. The warning explains how to revoke the saved override. Close-tab works even if the warning has expired, without enabling proceed.
- No extension API is reachable merely because the warning HTML is a web-accessible resource. Runtime operations additionally verify sender origin, top-frame ownership, same live tab URL, nonce and expiry. The warning cannot be used to grant unrelated hostnames.

## Verification

**Performed in this tool environment:** syntax parsing for modified JavaScript, manifest/package version equality, module smoke check for exact-host issuance and cross-tab denial, GitHub source inspection.

**Registered for later execution:** `tests/threat-warning.test.js` and `tests/threat-warning-background.test.js` as part of the existing seven-phase `bash scripts/test-local.sh` Ubuntu-only suite.

**Not performed:** the complete local Node/Python suite, Firefox main-frame redirect demonstration, native browser security/UX tests, real phishing-list download, private browsing, back/forward navigation, persistence-failure simulation and third-party blocker comparison. These remain release gates. Do not claim reliable phishing coverage, browser acceptance or public readiness.

## Manual Firefox acceptance cases

1. Use a locally controlled synthetic listed hostname, not a real malicious URL. Verify a GET top-level match shows the warning with a correctly attributed source and no private URL parts.
2. Confirm subresources and POST navigations are blocked, and the warning is not shown in the wrong frame/tab.
3. Try opening `blocked.html` without a valid tab-bound grant, with a forged nonce and after expiry: none may proceed. Close must still work.
4. Test unchecked acknowledgement, save failure, successful persist, exact-host homepage navigation, restart and explicit revocation.
5. Test a different hostname and subdomain to confirm override isolation and normal filter protection.
6. Verify clean Firefox YouTube ordinary videos, ad-supported films and Disney+ playback remain unchanged. No acceptance until these are observed.

No GitHub Actions, no new permissions, no hosted CI or package, no native helper dependencies and no silent browser opens.
