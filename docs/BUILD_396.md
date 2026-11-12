# Build 396 / v0.3.356: owner-approved Russian banner and Russian-only public site

**November 12, 2026. Development on the one permitted branch, main.**

The Russian README had been changed to reference the English cyan banner. This conflicted with the owner-approved Russian metallic artwork already present at `assets/images/Metallic Cyrillic Emblem and Gold Live Block Title.png` with Git blob ID `1ee6d3265a5f29c5d9656f74a0b427120887ffd3`. The website also preferred a historical remote URL before its local asset, and the language chooser deliberately skipped localization.

The Russian README now references the approved image. The website uses the identical local image first, with pinned immutable GitHub raw fallback, selects it immediately for Russian views and translates its language picker labels. Russian descriptions replace English terminology with Russian, while protected technical paths/email, link targets and actual English presentation are unchanged. No extension behavior, filtering policies, browser permissions or approved page geometry changed.

Regression tests check the original binary image identity, text coverage, language-switch reversal and technical identifiers. The full Ubuntu suite and visual GitHub Pages acceptance are not yet available in this environment. No public release status or complete blocker parity is claimed.
