# Build 305: integrated Facebook diagnostics without changing filtering

November 3, 2026. Version 0.3.275. Internal main source, not released.

**Evidence:** The owner's earlier screenshot showed a labeled Meta Glasses Ad on a regular Facebook feed with protection enabled and zero network blocks. Their voluntarily exported permitted-request report covered 504 completed permitted requests grouped into 15 host/type groups, including 83 first-party Facebook XMLHttpRequests. This is not proof that the permitted requests were advertising or that blocking was disabled; the screenshot was taken before Build 298's targeted linked-author fix.

**Change:** The existing read-only Meta Intelligence page's Check Facebook scanner and Export safe diagnostics buttons now produce a report combining existing scanner evidence with the separately authorized, current-tab Facebook GraphQL stats and setting. No new UI geometry or Firefox permissions. The same bounded sanitizer is used by the separately present GraphQL check.

**Privacy and correctness:** Only boolean flags and whitelisted finite integer counters are included. Unknown numeric fields, URLs, request bodies, account labels and hostile object properties are discarded. A missing/error GraphQL reply means unavailable, not disabled or zero. Recheck the exact tab URL after both probes to avoid mixing navigation generations. The fixed report explicitly warns that permitted network requests do not prove removal of sponsored content.

**Verification:** Production sanitizer compiled and rejected injected private fields in an isolated JavaScript smoke test. Five registered source tests cover sanitization, missing counters, false conclusions and UI linkage. The full native Ubuntu suite and actual Firefox Facebook acceptance remain open; no claimed ad-removal fix.
