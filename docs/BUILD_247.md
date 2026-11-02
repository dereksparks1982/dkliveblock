# Build 247 · v0.3.217: Meta provider traffic counts

The bounded local Meta evidence store now aggregates `allowed` and `blocked` request counts per third-party hostname, capped at 100,000 for each counter and 100 provider hosts total. It still stores **no** full URLs, payloads, headers, messages, identifiers, or cookies. A provider stays classified `unknown` and its identity remains `unverified` regardless of observed traffic volume; counters are not proof of advertising. All evidence is erased with the existing clear command or when request logging is turned off.

Added source tests, not executed in this environment. No new permissions, active filtering changes, GitHub Actions or UI layout changes. Live Firefox validation and company-ownership verification are still required.
