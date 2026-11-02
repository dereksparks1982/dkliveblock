# DK Live Block Build 269 / v0.3.239
## Agent Nesty Meta-04: expiry and ID reuse
Removed Sponsored labels can vanish between DOM updates, so DK caches their exact label by element ID briefly. Previously cache entries never expired, allowing a later React element with the same ID to be misidentified. This build stores only an exact ad label and a local timestamp, expires it after 15 seconds, and gives a current, non-ad label authority over old cached evidence. The 200-entry cap remains in force and expired entries are pruned during scans.

## Orion control safety
The experimental Orion popup now requires an http(s) current-tab URL, binds the current hostname to each request and refuses cross-site changed-tab responses. The content script checks the expected site before applying Pause/Resume; malformed local storage suspends cleanup rather than silently overriding a stored opt-out.

## Verification and constraints
New thirteen-case regression file added, six isolated cache checks evaluated with V8. Full Ubuntu test suite and real signed-in Firefox/Orion acceptance have not run. Meta GraphQL filtering remains off by default, and this is not a signed downloadable release.
