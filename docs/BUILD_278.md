# Build 278 / v0.3.248: Approved Russian banner replacement

## Approved visual direction
The owner's replacement image `assets/images/Metallic Cyrillic Emblem and Gold Live Block Title.png` is **the only approved Russian banner**. It matches the generated image accepted in conversation exactly, using Git's blob SHA-1 `1ee6d3265a5f29c5d9656f74a0b427120887ffd3` (1837941 bytes, 2172×724 PNG).

The image shows the single existing ДК emblem followed by `ЛАЙВ БЛОК`, with red, gold, and black styling and no extra copy, people, flags, or scenery. It does not repeat ДК text outside the emblem.

The previous Russian art `assets/images/ДК Лайв Блок_ Ваши правила.png` was removed by the owner and must not be restored. The separate English neon banner remains unchanged.

## Wiring
- `assets/site-localization.js` uses `assets/images/Metallic%20Cyrillic%20Emblem%20and%20Gold%20Live%20Block%20Title.png` for Russian and the original English banner for English. The existing browser-locale fallback, explicit language chooser and saved preference remain unchanged.
- `README.ru.md` uses the same approved Russian artwork.
- `assets/images/README.md` now records the approved language/banner mapping.
- Regression checks confirm the image's Git blob SHA, its expected path in the localization module, and the README reference. Historical Build 276 notes now say the old banner was superseded.
- No modifications to the extension icon, blocking engine, UI geometry, buttons, translations, or download targets.

## Test and acceptance status
Static source checks and asset hash verification are complete. An owner visual check on the published GitHub Pages website is still needed. This banner-only change is not a claim of browser-extension QA or Mozilla release readiness.
