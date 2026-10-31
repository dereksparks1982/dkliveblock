# Build 75: make YouTube response filtering reachable

Version 0.3.45. Earlier generic network rules could cancel the player JSON call before the new response filtering touched it. This build adds a narrow exception for first-party YouTube POST XHR requests to `/youtubei/v1/player` and `/youtubei/v1/get_watch` only when our response filter is enabled, after user-chosen manual blocks and site pause controls. No whole-domain allowlisting or cross-origin third-party ad exceptions. The Firefox response filter then attempts to drop only specific advertising arrays and lets unsupported or oversized replies through untouched.

Added a simulated full manifest background fixture for the path and corrected MAIN-world page-script disable ownership checks. Browser acceptance remains outstanding: **do not claim that this solves the YouTube anti-adblock wall or ad-funded films without live tests.**
