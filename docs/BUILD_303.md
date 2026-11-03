# Build 303: Russian utility text actually renders

Date: November 3, 2026. Version 0.3.273. Internal source on main, not released.

**Critical correction:** Builds 300–302 successfully registered local utility string dictionaries but the DOM renderer still recognized only keys from the older Settings dictionary. Build 303 routes every recognized local dictionary through the actual text and UI attribute rewriter.

The translator now handles known extension input/textarea placeholders while avoiding user-entered values. MutationObserver watches only aria-label, title and placeholder changes for late updates, with the existing bounded scan. Synthetic DOM smoke verified Russian rendering, English restoration and unchanged private form value. Added four regressions to local runner. No network interception, protection policy, video player, accounts, browser permissions or approved UI geometry changes.

Full Ubuntu suite, actual desktop Firefox Russian visual/keyboard QA and Orion separate capability validation are outstanding.
