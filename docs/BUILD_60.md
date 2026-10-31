# Build 60: site action safety and packaging audits

**0.3.31 | Unreleased source | October 30, 2026**

The Site Dashboard tolerates malformed/non-web tab URLs, serializes edits and revocations, disables controls while operations run, and verifies the tab identity before changing it. Backend routes for revoking dashboard hostname allowances and clearing the dashboard log check the current Firefox tab's hostname, rejecting attempts to mutate a former site after navigation. Narrow request exception revocation also accepts a mandatory site match when supplied by the dashboard.

The offline Firefox release audit now checks *all packaged HTML pages*, not merely the popup and options. It detects missing scripts/styles, inline scripts, duplicate IDs and references to absent static page elements. A new standard-library-only audit test exercises bad fixtures.

This remains unreleased source, not an accepted Firefox build. **Full local tests have not yet run in this development session**, and real Firefox user journeys, YouTube/Disney+ playback, filter updates, memory and ABP parity have not been verified. No GitHub Actions, external dependencies, new permissions or release artifacts.
