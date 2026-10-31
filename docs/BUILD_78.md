# Build 78: nested YouTube player replies and startup handshake

Version 0.3.48. Known ad-only metadata is removed from valid nested serialized player JSON while streaming, media, DRM and login information is retained. Unknown or forbidden child data is untouched. The MAIN-world script announces readiness to the isolated controller, which re-requests its own authorized setting. No remote scripts or telemetry. Firefox and full Ubuntu tests remain outstanding; competitor parity is unverified.
