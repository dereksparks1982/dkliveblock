# Build 279 / v0.3.249: Russian banner load recovery

The new owner-approved Russian banner is present in the GitHub repository and successfully appears in the Russian README, but the owner observed visible alt text instead of the image on GitHub Pages. This means the website image request failed. The browser screenshot confirms the problem; the precise deployment/network response could not be inspected here.

## Changes
- Keep the exact approved `assets/images/Metallic Cyrillic Emblem and Gold Live Block Title.png` (Git blob `1ee6d3265a5f29c5d9656f74a0b427120887ffd3`), preserving banner content and appearance.
- Prefer a fixed GitHub raw-content URL at the original owner-upload commit for the Russian website banner: `https://raw.githubusercontent.com/dereksparks1982/dkliveblock/2552853711159fdea179aad26efd1391f42c7f92/assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png`. This avoids reliance on GitHub Pages publishing the file at a relative path.
- Retain the in-repository relative asset URL `assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png` as the browser image-error fallback. If the first attempt fails, the page tries the alternate without entering a loop.
- Supply the original English banner's GitHub raw URL as an error-only fallback; do not change its preferred local source.
- Maintain one website, language switch, prior styles, README images, and extension assets. No telemetry, permissions, extension filtering, or approved UI changes.

## Verification
Repository file presence, exact Git blob SHA, localization source and test syntax checks performed. Live browser verification is still pending; the owner should refresh the published GitHub Pages page (possibly bypassing cache) and select Русский.
