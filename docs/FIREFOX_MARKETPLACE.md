# DK Live Block: Firefox Add-ons release checklist

**Not released. The user must explicitly approve publication.**

1. Reach or exceed Adblock Plus functionality and pass real Ubuntu Firefox testing, including YouTube/Disney+ playback and regression testing on ordinary websites. Review compatibility with Firefox Manifest V2 and current Mozilla policies.
2. Run `bash scripts/test-local.sh` in the local repository. This runs the complete offline Node suite and the Python release structural audit. No GitHub Actions or paid runner is permitted.
3. Have the user approve the finished UI, permissions, source snapshot and release notes. Create the accepted source snapshot, then local commit and annotated tag, then push and verify. No automatic publishing.
4. Only then invoke `python3 scripts/package-firefox.py --candidate` to create a deterministic **unsigned** Firefox ZIP under `dist/`. It deliberately does nothing without the explicit `--candidate` argument. It is not a released package.
5. Review `docs/PRIVACY.md` carefully. Confirm required Mozilla data collection disclosures, external list providers, requested proxy/DNS permissions, third-party service behavior, and privacy policy hosting.
6. Prepare final name, concise description, icon artwork, screenshots, support URL, release notes and required permission explanations. Review third-party filter-list licenses.
7. The user creates/signs in to their Mozilla developer account and chooses an **on-site public listing** in the Firefox Add-ons Developer Hub. Submit the unsigned package. Mozilla reviews and signs acceptable extensions. Respond to review feedback before authorizing public access.
8. For later releases, increment the extension version, rerun all gates and submit an updated ZIP for signing and automatic user updates.

## Licensing review before release

**DK Live Block is free for individuals and companies to use, including internal business use. Selling, charging for, or otherwise monetizing DK Live Block itself or modified versions is prohibited.** Review the [project license](../LICENSE), retain all required third-party notices, and confirm Mozilla's current submission requirements.

## Important limits
- No automatic proxy is bundled. Firefox selective proxy routing does not guarantee anonymity or block fallback to direct requests.
- No guaranteed bypass of a server-side paywall, protected streams, or network censorship.
- No claims of Adblock Plus parity or public readiness without actual external tests and user approval.
- Never create `.github/workflows` or run GitHub Actions. Repository pushes are source commits, not hosted builds.

## Bundled PSL attribution

The bundled Public Suffix List snapshot and generated JavaScript dataset are distributed under Mozilla Public License 2.0. Include `src/LICENSE-PSL.txt` in the extension package and keep `vendor/public_suffix_list.dat` in the source repository. Regenerate via `python3 scripts/update-psl.py --refresh`, which retrieves only from the canonical publicsuffix.org URL, then run all offline regression gates. Verify Mozilla source-submission requirements when applying.


## Build 219 submission sprint and source-readiness gate

See `docs/RELEASE_WEEK_2026-11-01.md`, `docs/AMO_REVIEWER_NOTES.md` and `docs/AMO_LISTING_DRAFT.md`. This is a **November 6 submission target**, not a promise Mozilla will approve/list before Saturday, November 7.

`scripts/amo-preflight.py --report` lists missing inputs without publishing or failing ordinary test development. `scripts/amo-preflight.py --strict` is mandatory for any authorized unsigned candidate package and currently rejects the missing authentic `package-lock.json`. Run exact `bash scripts/test-local.sh` on the owner's Linux checkout; resolve failures and compare the regenerated bundled Ghostery file against the accepted source before any submission. Packaging now adds the root custom owner `LICENSE` alongside packaged upstream MPL notices.

AMO requires accessible reviewer source for generated/bundled code, an exact original library source/version reference, reproducible steps, a clean store listing, and truthful privacy/permission disclosures. Obtain explicit owner acceptance, prepare a clean, non-private source upload, and complete the AMO developer account upload manually. Do not submit without a tested source+package pair. Site-level successful ad blocking should be preserved, not generalized to a universal competitor-parity certificate.
