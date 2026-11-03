# Build 308: fresh YouTube diagnostic export and navigation integrity
Date: November 3, 2026. Version 0.3.278. Unreleased GitHub source.

The Dashboard previously generated YouTube compatibility exports from cached `current` state. An intermittent ordinary-video refusal, reload or YouTube SPA navigation could produce a misleading report from a different moment. This is especially relevant because the owner reports distinct behavior for ordinary YouTube videos and Free with Ads movies.

A deliberate Export now verifies the selected tab and live hostname, requests fresh `getSiteDashboard` evidence from the existing browser background, verifies the selection and hostname again, and compares the tab's exact URL before and after the call. If the URL changed, no report is saved. Export and experiment interactions are serialized. Raw URLs are only compared in transient local memory; none are stored, logged, uploaded or included in report output.

A focused check of the navigation guard and JavaScript syntax passed. Five source unit tests and a corrected legacy export-source contract are included in the local Ubuntu runner. Full native Ubuntu suite and real Firefox ordinary-video and Free with Ads movie retests remain pending. This improves evidence reliability, **not** the YouTube playback regression itself.
