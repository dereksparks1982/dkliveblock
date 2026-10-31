# Build 80: observable YouTube player request-to-response filtering

Version 0.3.50. Distinguishes player POST requests handed off for filtering from responses actually received and modified. Dashboard and one-click TXT/JSON report now show both; no URL paths, tokens, cookies or video identifiers retained. Does not exempt player calls when Firefox response-filtering API is missing; rejects explicitly non-UTF-8 JSON and handles pathological response clones. This is debugging and compatibility work, not a proven live ad-blocking result. No GitHub Actions or released package.
