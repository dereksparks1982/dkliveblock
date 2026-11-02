# Build 253 · v0.3.223: more Elderred web projects + Facebook right-rail fallback

## Published project links
Added a new **More from Elderred Softworks** section above the existing footer in both `index.html` and `docs/index.html`, with four project website links rather than repository links:
- Hanafi Learning Deck: `https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/`
- Folkhold: `https://dereksparks1982.github.io/folkhold/`
- Nougat Media Plus: `https://dereksparks1982.github.io/Nougat-Media-Plus/`
- Capital & Consequence: `https://dereksparks1982.github.io/capitalandconsequence/`

The first three website addresses were verified against the relevant project README files. Capital & Consequence's repo has GitHub Pages enabled, a root `index.html` and `.nojekyll`, but its repository homepage metadata still points to the previous `/federalelectric/` path. The new public address has not yet been verified as accessible; owner should inspect repository Settings → Pages, deploy `main`/`(root)` if needed, and update repository About → Website. Never treat metadata as a successful deployment.

Page card CSS, original controls, footer and visual geometry preserved.

## Facebook change
- Integrated a bounded, MIT-inspired fallback in DK's existing Facebook ad scanner for a visible **Sponsored** label drawn as an ordinary span rather than a `h1`–`h6` or `role=heading`.
- Restricts candidates to the right rail by screen position, label bounds, exact text, and existing safe section resolver with Contacts/Birthdays/other protected headings. Hides via DK's existing reversible operation, no parallel extension engine.
- Performed a synthetic JavaScript smoke fixture: a short Sponsored span inside a bounded rail section was hidden, while a Contacts section was preserved. Added committed regression fixtures for that case, and for all four website links.
- **Not tested in real Firefox:** Facebook owner screenshot remains a FAIL until a fresh acceptance run. Full Linux suite not executed. No new permissions, branches, GitHub Actions, external runtime dependencies, or accepted UI geometry changes.
