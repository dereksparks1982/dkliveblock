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

## Important limits
- No automatic proxy is bundled. Firefox selective proxy routing does not guarantee anonymity or block fallback to direct requests.
- No guaranteed bypass of a server-side paywall, protected streams, or network censorship.
- No claims of Adblock Plus parity or public readiness without actual external tests and user approval.
- Never create `.github/workflows` or run GitHub Actions. Repository pushes are source commits, not hosted builds.

## Bundled PSL attribution

The bundled Public Suffix List snapshot and generated JavaScript dataset are distributed under Mozilla Public License 2.0, not the application-code MIT license. Include `src/LICENSE-PSL.txt` in the extension package and keep `vendor/public_suffix_list.dat` in the source repository. Regenerate via `python3 scripts/update-psl.py --refresh`, which retrieves only from the canonical publicsuffix.org URL, then run all offline regression gates. Verify Mozilla source-submission requirements when applying.
