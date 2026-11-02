# Build 277 / v0.3.247: Correct Russian introduction and legal brand spelling

**Purpose:** Fix the user-reported misspelling produced when translating the Cyrillic phonetic spelling of Elderred Softworks back into English.

## Changes
- Russian hero copy: **«Ваш браузер. Ваши правила.»** followed by:
  > Бесплатное расширение для Firefox, которое блокирует рекламу и отслеживание, защищает от всплывающих окон и скрывает нежелательные элементы страниц. Разработано Elderred Softworks.
- The correct product creator name appears exactly as **Elderred Softworks**, not as «Элдерред Софтворкс» or a back-transliterated variant, in localized website copy and `README.ru.md`.
- Site metadata uses «отслеживания» in the technical sense of web tracking.
- English source copy, the approved banners and icon, color assignments, downloads, information panels and UI geometry remain unchanged.
- Browser extension blocking mechanics and permissions unchanged.
- Automated regression added for English/Russian translation and company-brand spelling.

## Acceptance status
- Source-level and focused synthetic regression checks only. Actual GitHub Pages/Firefox render still requires a live browser check; do not claim it passed.
- No package download or live installation performed.
