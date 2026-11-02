# Build 248 · v0.3.218: Meta intelligence viewer

Added a dedicated extension-local Meta provider intelligence page. The existing Site Dashboard exposes a single link inside Filter Coverage only when the selected tab belongs to a recognized Meta website. The viewer uses the already implemented extension-only commands to show bounded third-party hostnames, unknown/classified purpose, allowed and blocked counts, and evidence tokens. It offers Refresh and a confirmed Clear Evidence action. It renders network-derived strings via textContent, not HTML; no full URL or payload is presented.

No existing dashboard controls were relocated. This is an observation interface only, not a way to designate a third-party domain as an ad company or silently add blocking rules.

Source tests added; not executed here. Live Firefox and Linux suite checks remain pending. Facebook auto-hiding not yet accepted.
