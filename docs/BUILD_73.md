# Build 73: genuine YouTube response filtering

Version 0.3.43. Firefox MV2 only.

Unlike cosmetic-only earlier builds, this build attempts to remove known ad-placement structures from specific first-party JSON replies to `/youtubei/v1/player` and `/youtubei/v1/get_watch`. The response filter is on by default, reversible in Settings, strict on site/method/type/content-type/status, limited to 1.5 MB and passes unknown, invalid and oversized replies through unchanged. It does not intercept video, DRM, account credentials or advertising bytes in media streams. The Site Dashboard shows counts for eligible/modified/untouched/oversized/error results without capturing payloads or video identifiers.

Static source checks and hand-run isolated module checks are **not** a substitute for full Node/Python source tests and normal-vs-free-film Firefox playback tests. It is possible that current YouTube formats differ, particularly ad-supported films or signed-in content. No release, signing, or uBlock equivalence claim is justified until browser evidence supports it.

Follow-up: trusted local scriptlet dispatch, redirects, filter parity, stronger QA and playback metrics per master parity plan. No Github Actions or additional dependencies.
