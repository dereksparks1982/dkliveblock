# Russia-facing distribution and user-safety review

**Review date:** November 2, 2026  
**Owner:** Elderred Softworks LLC / DK LAB  
**Status:** Engineering compliance checklist, **not legal certification or authorization to distribute in Russia**. Recheck with qualified Russian and U.S. counsel before specifically marketing or formally distributing in Russia. Laws, enforcement and access restrictions may change.

## Scope and principles

DK Live Block is a free, Firefox-first **advertising/tracker/privacy** extension. Normal ad filtering is not itself a VPN service. A Russian translation does not establish the user's citizenship, physical location, legal jurisdiction or consent. **Never infer Russian legal status from language, IP address, DNS, timezone, browser, account or filter-list choice.** Do not silently weaken privacy, remove normal site functionality, insert state tracking or disable filtering because a user chooses Russian.

Maintain one codebase and the existing privacy and site-exception controls. No release or regulatory compliance claim without testing and actual legal review. The developer should comply with applicable law, but avoid promising that the software guarantees any user's compliance.

## Relevant Russian legal issues (fact vs open question)

1. **Circumvention and VPN promotion.** Federal Law No. 281-FZ of July 31, 2025 provides penalties related to advertising access-circumvention tools. Federal Law No. 149-FZ Article 15.8 addresses services enabling access to information restricted in Russia; the Russian Ministry of Digital Development clarified its relevance to VPN providers in April 2026. DK Live Block has an **existing optional user-supplied Firefox proxy routing** capability (`src/network-recovery.js`; disabled by default). It provides neither a VPN nor a proxy server, but that alone does not resolve its regulatory classification. **Potential distribution blocker: obtain a Russia-specific opinion on the optional routing feature before any market-facing release.** Do not advertise the extension as bypassing Russian restrictions, recommend Tor/VPN as a feature or market it as a circumvention service. Any proposal to remove/restrict existing functionality requires owner authorization and a regression plan; changing interface language does not grant that authorization.
2. **Advertising on restricted services.** Federal Law No. 72-FZ of April 7, 2025 and Law No. 38-FZ on Advertising restrict advertising on certain blocked or prohibited online resources from September 1, 2025. The Federal Antimonopoly Service's March 25, 2026 guidance addresses Instagram/Facebook and VPN services, with specific transition discussion for Telegram/YouTube through 2026. **Do not place promotional/paid DK Live Block campaigns on sites covered by the prohibition.** This concerns promoting/placing ads, not the act of suppressing an unwanted ad in a user's browser. Recheck the relevant platforms and official orders before marketing.
3. **Personal data and processing.** Federal Law No. 152-FZ Articles 18, 18.1 and 22, including Federal Law No. 23-FZ changes effective July 1, 2025, impose duties on entities that collect/process Russian citizens' personal data, including localization and possibly notification requirements. Today's browser-local settings and bounded local-only diagnostics reduce exposure, but do **not** by themselves prove no obligations exist. Audit website analytics/cookies, contact forms, support emails, GitHub Issues, externally hosted filter-list downloads and any future cloud or AI features independently. If DK LAB becomes an operator collecting Russian citizens' personal data, obtain legal review of notices, lawful bases, localization, notifications, cross-border transfer and retention **before collection**. Do not add developer-operated analytics or automatic diagnostics uploads.
4. **Russian-language consumer disclosure.** Federal Law No. 168-FZ (effective March 1, 2026) and the Russian consumer-protection framework include Russian-language information requirements. The precise application of Article 10.1 to an overseas, free browser-extension website needs legal review; preexisting Articles 8–10 also matter. Provide accurate Russian-facing product terms, developer identity, license, support and understandable privacy/connection notices, without claiming complete interface translation before QA. Keep English branding as branding, and make the local notice accessible from the Russian README.
5. **U.S. export/sanctions obligations.** Elderred Softworks is U.S.-based. OFAC Russia-related sanctions/IT-services rules and Commerce/BIS export controls require separate review for distribution, updates, support, donations and dealing with restricted persons. OFAC's IT-services determination does **not** prohibit all internet communications, but this is not blanket permission for every software transaction. Check current OFAC guidance and BIS authorizations before targeted Russian distribution.

## Current product inventory and actions

| Surface | Today | Action/gate |
| --- | --- | --- |
| Firefox filtering and user exceptions | Same engine worldwide; normal ad blocking and local privacy controls | **Preserve**. No Russian-only blocking changes. |
| Interface and Russian website | Russian website and partial Russian popup/options localization | Improve coverage, human proofreading and accuracy without changing approved art or geometry. |
| Proxy/Open Access | Existing manual SOCKS/HTTP(S) routing, **off by default**, no service supplied | Remove *marketing-like* bypass/Tor recommendations from UI wording; retain behavior while reviewing legal classification. Reassess before Russia-facing release. |
| Reports/diagnostics | Local until user explicitly exports/sends; third-party filter/update endpoints are contacted | Preserve opt-in/host-only privacy rules; document network effects in Russian; audit actual hosted website scripts separately. |
| Marketing/support | Voluntary Patreon, Proton email, GitHub Issues | Do not purchase/place ads on restricted platforms; assess data collected if people voluntarily email, post issues, or donate. |
| Russian-specific release approval | **Not completed** | Do not claim regulator approval, full legal conformity, or a Russia-certified build. |

## Release-gate checklist (owner review required)

- [ ] Current Russian counsel reviews the actual extension, particularly `src/network-recovery.js` optional proxy and potential Article 15.8 implications.
- [ ] U.S. sanctions/export review for free distribution, software updates, optional support payments and relevant recipients.
- [ ] Privacy/data flow mapping of website, extension, list providers, update mechanism, diagnostic exports and external support channels; identify any Russian-citizen data collection and its legal basis.
- [ ] Human Russian-language review of product website, extension options, privacy notice, license and support, with user-facing notices accessible before download.
- [ ] Verify no promotion on legally restricted advertising resources, and recheck Russian restrictions at campaign time.
- [ ] Actual Firefox functionality, privacy, login, proxy-off default and no locale-sensitive protection changes validated; record scoped test outcomes.
- [ ] Final owner approval and qualified legal sign-off before presenting Russia-targeted distribution as compliant.

## Legal/source record (accessed 2026-11-02)

- Federal Law No. 281-FZ (VPN/circumvention advertising): https://base.garant.ru/412423444/
- Federal Law No. 72-FZ (advertising on restricted resources): https://base.garant.ru/411825212/
- Russian Federal Antimonopoly Service clarification, March 25, 2026: https://base.garant.ru/413952580/
- Federal Law No. 149-FZ, Article 15.8: https://www.consultant.ru/document/cons_doc_LAW_61798/1a807328c80a540bd0bb724927d6e774595431dc/
- Ministry of Digital Development April 27, 2026 reply on VPN operators: https://www.consultant.ru/document/cons_doc_LAW_534443/
- Federal Law No. 152-FZ, Article 18: https://www.consultant.ru/document/Cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/
- Ministry of Digital Development May 12, 2025 clarification of Law No. 23-FZ data localization: https://www.consultant.ru/document/cons_doc_LAW_511584/
- Rospotrebnadzor Russian-language information clarification (2026): https://www.consultant.ru/document/cons_doc_LAW_527943/
- OFAC FAQ 1184 (U.S. Russia IT/software services, limits and exceptions): https://ofac.treasury.gov/faqs/1184
- OFAC FAQ 1040 (internet communications GL 25G): https://ofac.treasury.gov/faqs/1040

**Maintenance rule:** recheck official sources before Russia-facing release or campaigns, at least quarterly when relevant to an active launch, and immediately after material legal or product changes. Never auto-implement a speculative legal restriction.
