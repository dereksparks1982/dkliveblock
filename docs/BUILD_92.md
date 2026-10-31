# Build 92: repeated YouTube navigation handling

Unreleased 0.3.62. YouTube uses single-page navigation, replacing initial player/feed data without full reloads. Previously the MAIN-world helper examined these data only on first activation. Repeated authorized enable events now re-examine new bootstrap data, while keeping the existing fetch/XHR wrappers, no duplicate hooks and no accessor rewriting. Refused playback responses remain intact. Tests cover newly assigned data, repeated refreshes, and disabled mode. Live Firefox and full offline tests remain outstanding.
