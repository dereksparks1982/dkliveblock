# Build 91: first-party relative YouTube API coverage

Unreleased v0.3.61. YouTube's fetch/XHR calls can use relative paths while the existing feed helper intentionally accepts absolute HTTPS URLs. This prevented MAIN-world feed/Shorts filtering on those relative requests. The page bridge now resolves candidate URLs against its own current page origin for scope checks, response classification and XHR state. Target request methods and domains remain constrained; unrelated GET, external origin and unknown endpoints remain untouched.

Added relative-path fetch/XHR fixtures. Source tests are not proof that every YouTube ad or anti-adblock refusal is solved. No external dependency, CI, or public release.
