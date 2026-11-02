# DK Live Block public website: educational information hub

Website update following Build 263 (extension remains `v0.3.233` because extension runtime code did not change).

## The homepage now has two balanced sets of six interactive cards

### What it does (six lessons)
1. Block ads and trackers.
2. Stop unwanted popups.
3. Inspect and control requests.
4. Choose what stays.
5. How ads reach you.
6. Cookies and tracking.

Each entire card is a single accessible anchor and opens its own native HTML dialog containing a detailed explanation, limits, concrete examples, and an activity the reader can try. The explanations distinguish observed request activity from verified advertising, ad hiding from request blocking, and cookie attempts from enforcement. Experimental capabilities are explicitly identified.

### Guides, updates & projects (six practical information boxes)
1. Development status.
2. Install in Firefox.
3. Downloads and versions.
4. Free use and licensing.
5. Help and reporting.
6. Other Elderred projects.

The original detailed website sections are retained verbatim inside these six dialogs. Download locations, the test-install procedure, warnings about unsigned XPI packages, the custom noncommercial license, the bug-report address, source and roadmap links, and the three project websites have **not** been removed. All three other project buttons remain accessible in the sixth dialog: Hanafi Learning Deck, Folkhold, and Capital & Consequence. Nougat Media Plus remains excluded at owner's request.

## Owner-requested card-size and copy refinements
- All twelve card surfaces are fully clickable; the repetitive “Explore the details” / “Open details” prompts were removed.
- The two six-card grids now share one responsive row-height value. At page load and browser resize, a small local layout routine measures all twelve at their natural sizes and applies the tallest height to both grids. This keeps the top lessons and lower information cards **exactly the same size**, while accommodating different descriptions and text wrapping.
- There is no fixed-height clipping for long card descriptions. When JavaScript is unavailable, the original content-sized grid is the fallback.
- Both GitHub Pages entrypoints stay identical, with all dialogs, long-form details, top-level download links, and three selected project buttons preserved.

## Interaction and accessibility
- Entire card can be clicked, not only a small text link.
- Native `<dialog>` used with `showModal()`, yielding keyboard Escape support and focus containment in compatible modern browsers.
- Each card declares `aria-haspopup="dialog"`, links to a real matching dialog, and has a full-card focus outline.
- A focused Close button is shown on opening; closing the dialog restores focus to the selected card.
- Clicking outside a dialog also closes it.
- Dialog content scrolls independently of the homepage; card heights and columns remain controlled by the existing responsive grid.
- The hero download/support buttons and footer remain directly accessible at page level.

## Source synchronization and testing
- Website entrypoints: `index.html` and `docs/index.html`, byte-for-byte matching.
- Regression fixture: `tests/website-education-hub.test.js`, covering all twelve card/dialog pairs, original guide content, links and keyboard mechanisms.
- Static integration inspection: 12 matching and uniquely named card/dialog pairs; balanced section and dialog markup; three approved project link buttons; both site files identical.
- A real-browser mouse/keyboard interaction pass and responsive/mobile visual QA still need to be performed. The website update does not change the extension's Firefox filtering behavior.

## Editorial principle
Make DK Live Block both protective and educational. Avoid guessing who owns a request or cookie, claiming that a visually hidden ad was prevented from loading, or describing unfinished functionality as active protection. The educational text should remain accurate as new builds arrive.
