# DK Page Architect: reversible clean viewing

**Status:** Build 374 introduces the offline planner and contract tests only. The
feature is **not enabled** and does not change the YouTube page in Firefox yet.

## Goal
Offer a user-selected clean viewing layout: video player, search/masthead, title,
actions, description, and optional comments/related videos. Keep YouTube's own
player and transport. Never fetch the video directly, fabricate playback
authorization, bypass DRM, or silently replace native account controls.

## Implementation stages
1. **Planner (done):** exact HTTPS YouTube watch pages only, an explicit opt-in
   configuration, a mandatory original player, and a strict list of regions.
2. **Read-only discovery:** verify actual page regions without collecting
   histories or URLs; provide unknown-markup fallback.
3. **Reversible local CSS:** use a scoped style class to hide unselected
   peripheral containers; preserve the player, accessibility controls,
   captions, search, sign-in and legitimate interactive dialogs.
4. **Controls:** user-visible opt-in Clean View and Restore Original buttons;
   per-tab state only initially. Obtain owner approval for UI geometry.
5. **Acceptance:** same-video play/pause/seek/captions/fullscreen, keyboard,
   mobile breakpoints, SPA navigation, refusal overlays, Firefox restart,
   cookies/login, and performance under MutationObserver churn.

**Important:** A rebuilt presentation is not a replacement for network ad
filtering and does not itself defeat YouTube server-side adblock enforcement.
The feature will stay inactive until the owner approves the layout and it
passes ordinary-video playback tests.
