# DK Live Block: AMO listing draft (approval required)

**Not published.** This is editable copy for the owner's eventual Firefox Add-ons submission, not a live listing or a claim of tested universal functionality.

## Suggested name
DK Live Block

## Suggested short summary
Block ads, trackers and unwanted popups in Firefox. No paid tiers or Acceptable Ads.

## Suggested description

**DK Live Block** is a free-to-use Firefox-first ad and tracker blocker from Elderred Softworks / DK LAB.

It combines a bundled filtering engine with established filter subscriptions, including EasyList and EasyPrivacy. Ads and common tracking requests can be blocked before they load; cautious page filters can remove distracting ad placements. The extension also includes strict protections against unwanted advertising tabs from selected popup-heavy sites.

**Control what is blocked:** inspect allowed and blocked request groups locally, pause a website, make site-specific exceptions, manage custom rules, and review changes.

**Privacy-oriented by design:** the developer does not collect personal browsing history, insert advertisements, sell user data, or send telemetry. Filter-list updates connect to external publishers; optional user-invoked diagnostics and network routing have their own documented privacy implications.

**Free, including for businesses:** everyone may use DK Live Block at no charge. Selling, paid repackaging or monetizing DK Live Block itself is prohibited under the custom license for newly licensed original code; bundled third-party components retain their original licenses.

**Streaming:** the developer has observed successful blocking on YouTube and Disney+ in specific real Firefox sessions; results can change as websites update. Playback compatibility and coverage are not guaranteed for every video or service.

**No Acceptable Ads. No paid features. No sponsored messages.** The core extension requires no separately installed filtering engine.

## Required choices before submitting

- **Category:** Privacy & Security; second category only if appropriate in AMO's current taxonomy.
- **Support email:** elderredsoftworks@proton.me.
- **Support website:** approved repo/support page.
- **Price:** free. Some optional capabilities can use third-party networks/proxies but none is a required paid add-on.
- **License:** select an accurate custom/non-standard category only if AMO supports it; link to `LICENSE`. Do not select MIT for new original code or misidentify MPL-2.0 vendor materials.
- **Privacy policy:** publish the reviewed `docs/PRIVACY.md` at a stable public link and disclose external filter-list publisher requests, optional diagnostics, DNS/proxy, and update behavior.
- **Screenshots:** capture *actual* owner-approved Firefox UI, unaltered. Avoid private browsing history, account names, DNS logs, and copyrighted playback stills.
- **Review notes/source:** attach a reproducible source archive after exact SHA, npm lockfile and rebuilt vendor bundle have been verified; link to `docs/AMO_REVIEWER_NOTES.md`.
- **Permissions:** explain webRequest, all-host access, tabs, proxy, DNS, optional nativeMessaging, and devtools using the current actual implementation. Limit any unneeded permissions only after testing.
- **Owner approval:** final description, icon, license, screenshots, signed-off acceptance and exact source candidate are mandatory.

No source-only test or user-reported successful site session substitutes for Mozilla validation/signing.
