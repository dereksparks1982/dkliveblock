# Build 245 · v0.3.215: Meta third-party provider observations

- Load shared company and provider intelligence in the Firefox background context.
- Feed **hostname-only** observations to a bounded local in-memory provider store from existing completed/blocked request handling, only when the current tab is a Meta platform, logging is enabled, and the destination is outside known Meta domains.
- Classify the observed third party as `unknown`, not an advertising provider by assumption. A blocked request only documents what the filter engine did, not company ownership or why the user received it.
- Observations contain no full URL, path/query, request ID, header, cookie, body, account information, or message text.
- Clear provider evidence immediately when the user disables request logging.
- No new request interception or network-blocking rules; existing YouTube and other protections untouched.

**Not yet finished:** user-visible grouped intelligence UI, independently verified provider ownership, cross-platform countermeasure activation, AI evaluation and full browser testing. Tests added but not executed here.
