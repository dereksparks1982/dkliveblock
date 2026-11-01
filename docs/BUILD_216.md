# Build 216: full opt-in public domain registration and infrastructure investigation

**Version:** 0.3.186 (unreleased, November 1, 2026). **Protected rollback:** Build 203 `8f4c6739ddba2cbb1a64918639d014ccf31a8f54`.

## User requirement

A blocking log must do more than show a hostname. The owner wants to investigate the exact observed destination: public registration and owner fields, registrar, contacts, infrastructure, DNS, threat classification evidence and even small metadata details. The extension should return every **available, verifiable public detail**, not pretend that a redacted registrant or the purpose of a request can be known.

## What is now included

- **Public domain RDAP**, only after the user clicks Investigate on an actually blocked hostname in the selected live tab: domain registry handle, LDH/Unicode names, nameservers, statuses, all bounded registration events, DNSSEC presence, public registrant/registrar/technical/abuse roles, available public organization/name/email/telephone/address fields, remarks, notices and public record links.
- **Firefox DNS resolution**, also on explicit click: returned IP addresses, optional canonical hostname and TRR indicator. The extension presents addresses as *observed infrastructure*, not as evidence of website identity.
- **Sampled IP network registration**, when a public IPv4 address is available, through a single bounded HTTPS RDAP lookup. Reports network handle/range/country and publicly declared administrative entities. LAN/private, link-local, reserved/documentation and IPv6-only results do not trigger this additional lookup. The user sees when hosting-network data is unavailable.
- **Local source classification** using our recently introduced phishing-domain cache, with explicit feed update timestamp, whether the exact hostname is listed, and whether the user overrode blocking. An absent listing means unknown, not safe.
- **Local TXT/JSON investigation export** through the existing individual blocked-request export buttons. Details are included only when the explicit lookup happened in this dashboard session.

## Security, privacy and limitations

- The backend retains strict origin/context validation: only an exact currently blocked hostname in the active live site tab may be queried. It does not expose browsing history, request URLs, cookies, credentials, headers, or payloads to RDAP services. Domain registration is queried over HTTPS to `rdap.org` (the service may redirect to the appropriate registry); a public IP may separately be queried using `rdap.org/ip/...`. The click therefore discloses the investigated domain and possibly sampled IP to the lookup services and usual DNS infrastructure.
- Raw public fields are bounded and stripped of unsafe links; they are rendered with `textContent`, not injected HTML. The parent domain registrar, DNS hosting provider, network registrant, and underlying site's operator can all differ.
- The exact intent of a request, its payload content or who operated a shared hosting tenant cannot be inferred merely from RDAP/DNS. Privately registered domains often cannot reveal a legal owner.
- Six module smoke tests passed; full Ubuntu integration and real Firefox have not run. No new permissions, UI geometry movement, telemetry, bundled executable dependencies, GitHub Actions, README release notes, tags or public release.

**Next:** Add a more ergonomic, source-labelled investigation card and one-click threat override/blocked-site warning without automatically leaking visited domains to a cloud reputation provider.
