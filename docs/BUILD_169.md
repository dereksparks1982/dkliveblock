# Build 169: Blocked requests now have reversible Allow switches

**Unreleased 0.3.139, October 31, 2026.**

## User-requested behavior
The site dashboard's **Blocked requests on this tab** list keeps its approved layout and Details buttons, and now includes a checkbox per retained event. Checked means allow **future** requests for that exact current website, destination hostname, and Firefox resource type; unchecked restores normal automatic filtering. A confirmation explicitly warns about advertising/tracking and persistence across tabs/browser restarts. All historical entries with the same host/type reflect the same saved choice on refresh. A browser reload may be required to observe the difference.

This is **not a per-URL allowance** because DK intentionally retains only hostnames, request types and coarse timestamps. The setting uses existing, validated `DKRequestControls` with the already approved `requestAllowances` local storage field. No raw private URLs or request bodies are retained, and no new permissions were added.

## Safeguards
- Only the extension's trusted interface can invoke `setBlockedRequestAllowed`; a matching, live HTTP(S) tab and exact site are checked again in background.
- A new allowance requires the blocked event to be in that tab's currently retained log, local request logging enabled, active protection, and explicit confirmation.
- Popup events are never eligible, and manual selectively blocked host/types are deliberately protected instead of silently deleting a user's explicit block.
- Disabling a checkbox only revokes the matching remembered/session/temporary allowance and restores list rules. It never invents a new block merely because an old event was blocked.
- If persistent storage fails, original allowance state is restored.
- Site dashboard and background tests cover exact host/type control, the content-script boundary, event ownership, cancellation, and permission revocation.

## Status
This build addresses the blocked-request UI, **not YouTube's playback/enforcement problem**. Your Shutter Island screenshot and diagnostic export are preserved as a reference for successful playback, but are not proof that every ad was removed. Full seven-phase Ubuntu suite and real Firefox regression are still pending. No GitHub Actions or user download package. No release.
