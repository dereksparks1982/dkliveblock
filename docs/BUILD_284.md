# Build 284 / v0.3.254: Russian regulatory readiness and truthful proxy wording

**Date:** November 2, 2026. **Branch:** `main`. **Type:** Compliance architecture, disclosures and UI copy only. No change to protection engines or geographic targeting.

## Owner direction
Prepare DK Live Block for lawful Russian-language use and potential Russia-facing distribution. Treat this as a formal **review requirement**, not as proof of compliance with all Russian laws or regulator approval.

## Changes shipped in source
- Add `docs/REGIONAL_COMPLIANCE_RUSSIA.md` with dated Russian and U.S. regulatory references, distinctions between ad blocking, restricted-platform advertising, circumvention services, data localization and consumer language obligations, and a prelaunch legal sign-off checklist.
- Make Russia-facing legal diligence a mandatory Company Bible rule. Do not infer citizenship/location from Russian UI; no silent censorship, geolocation or telemetry changes.
- Add user-facing `docs/NOTICE_RU.md` explaining local blocking, opt-in reports, outside filter-list providers, optional proxy routing, limits and support in Russian; link from Russian README without adding an engineering diary there.
- Reword existing optional proxy settings from **Open Access/restricted websites/Tor recommendation** to a neutral **Proxy Settings** disclosure. No change to the user-supplied proxy feature, its disabled default, Firefox permissions, or the ability to choose exact sites.
- Update the Russian translation key corresponding to the settings heading and add a regression assertion in the already registered network-recovery test module.
- Synchronize Firefox manifest and package version at **0.3.254**.

## Legal decisions still open (do not present as resolved)
1. Qualify Russian Law No. 149-FZ Article 15.8 and Laws 281-FZ/72-FZ against the actual optional proxy feature and marketing plan, with Russian legal counsel.
2. Assess possible Russian personal-data operator/localization/notification obligations for website, third-party downloads, support email and any future collection. The current browser-local design is favorable but not a certificate of exemption.
3. Review Russian-facing disclosures and exact scope of consumer-language obligations with a qualified Russian reviewer.
4. Verify applicable U.S. OFAC/BIS rules for free software distribution, downloads, support and donations.
5. No Russia-targeted promotion or compliance claim until legal and owner approval.

## Quality and behavior limits
Existing Facebook/YouTube/Disney+ blocking, Russian and English banner assets, website card geometry, Mozilla manifest permissions, Nesty catalog, browser profile detection, proxy controls, default-off GraphQL option and privacy settings remain unchanged. The new test is a source/disclosure assertion, not a Russian device test or legal certification.

Prior Build 283 post-fix Linux run [41539831637](https://github.com/dereksparks1982/dkliveblock/actions/runs/41539831637) recorded 1,235/1,235 passing Node tests and six passing Python scripts, but the release audit still failed because of the missing authentic npm package lockfile. **Build 284's revised UI wording has not been retested through the full Linux runner or a real browser.** No new GitHub Actions workflow/run was created for this documentation-oriented build.
