# DK Live Block Build 65: per-site allowed request transparency

Version 0.3.35, unreleased.

The user found that GitHub was allowlisted, but the popup showed only zero blocked requests and no way to see what the browser permitted. This build records completed permitted HTTP(S) subresource requests in bounded tab-local memory (hostname, request type, count and coarse last time only), only when the existing private logging setting is on. It never stores request paths, credentials, cookies, bodies or identifiers. The counter is total completed events, not number of domains and not proof that a site was safe.

The Site Dashboard lists each observed destination+resource type, including the count, and exposes checkbox toggles to block future requests on the selected website. Choices are remembered locally and can be reversed. Manual blocks are an explicit exception to site-wide allowlisting. They do not block full-page navigation or known critical authentication resources, and do not apply while globally disabled or the tab is paused. No automatic YouTube or advertising allowances are added. Enabling a block requires a confirmation and proof that Firefox observed the requested destination/type on the currently selected tab; unblocking previously saved choices remains possible after reload.

The user-supplied Ubuntu test output for Build 64 recorded 145 passing out of 146 extension-structure tests. Its lone failure was the icon-state test assuming icon-state.js was second-last, before rule-evidence.js was inserted. Build 65 tests relative load order instead.

Source syntax and targeted checks are planned; live Firefox and full test suite acceptance remain pending. No GitHub Actions, ZIP or external runtime dependencies.

Post-implementation hardening: permitted-request rows now provide an Inspect panel with explanatory, inferred service-operator information and optional research links. Saved manual block toggles remain visible and reversible when private request logging is disabled. Control changes refresh the dashboard once, revert cleanly on declined confirmation or failure, and protect against tab navigation. Added pure-model and backend integration regression tests including an allowlisted GitHub website, confirming that only an observed exact hostname/type can be manually blocked and later unblocked.
