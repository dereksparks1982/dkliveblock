# DK Live Block Build 34: conservative procedural cosmetic aliases

**Version 0.3.5, UNRELEASED source.**

The site-scoped `#?#` procedural parser accepts `:has-text(...)`, `:-abp-has-text(...)` and `:has(...)` in addition to the two previously supported `:-abp-contains(...)` and `:-abp-has(...)` forms. They reuse the existing bounded, non-executable text inclusion and descendant selection predicates. Rule length and selector validation, explicit website scope, exceptions and the streaming-player/auth safety checks remain unchanged.

Malformed nested expressions, semicolon-based property/action injections and scriptlet expressions are still rejected. Unsupported redirect/scriptlet rules remain unsupported and are not executed.

**Release gates unchanged:** full regression suite, real Firefox YouTube and Disney+ tests, browser security/performance evaluation, ABP parity and explicit authorization.
