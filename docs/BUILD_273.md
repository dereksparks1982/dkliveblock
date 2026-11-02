# Build 273 / v0.3.243: Agent Nesty 4, popup sentry

User report: XNXX still opens redirect tabs.

Agent Nesty 4 is the fourth globally numbered specialist (Nesty 1–3 are cookie observers). It integrates with the existing strict popunder and original-tab guards without creating a competing engine.

This extension to XNXX watches tabs.onCreated, webNavigation.onCreatedNavigationTarget, tabs.onUpdated and webRequest.onBeforeRequest. Only a child tab with an observed XNXX opener and an external HTTP(S) destination is eligible. Early request cancellation prevents foreign content loading while revalidating the original tab against Firefox's current URL before removing the child tab. Same-site video tabs remain untouched, as do recognized authentication popups and user-permitted tabs. In-memory attribution expires after 15 seconds, keeps only tab identifiers, hostnames and timestamps, and has a 256-record cap.

No Firefox permissions, other site scopes, core YouTube/Disney+ network handling, or approved UI geometry were changed.

**Verification needed:** full Ubuntu seven-phase suite and real Firefox XNXX video interaction. Openerless windows that Firefox cannot associate with a source and popup tricks outside browser-observable signals cannot yet be guaranteed blocked.
