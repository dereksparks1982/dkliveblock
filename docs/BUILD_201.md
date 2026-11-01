# Build 201: Network controls, list integrity, popup safety and privacy

**Unreleased source:** 0.3.171, November 1, 2026.

Major four-workstream build: (1) Network Monitor can now block previously allowed traffic using a confirmed, reversible site+hostname+type switch and a lightweight authenticated view of active selective rules, alongside its existing Allow controls; (2) filter-list auto-refresh rejects HTML/XML/JSON error pages and suspicious empty replacement lists; (3) strict popunder grants and claims enforce valid times and reject clock rollback; (4) network capture validates DNS labels/timestamps and whitelists safe explanation labels. Regression coverage includes a full background control interaction. No new permissions, new runtime dependencies or UI geometry changes.

Focused production-source smoke checks and JavaScript syntax passed. The full seven-phase Ubuntu suite and real Firefox/YouTube acceptance have **not** been run here. The update does not establish uBlock Origin parity or ad-free streaming. No GitHub Actions, public XPI, external runtime filtering downloads, or user terminal commands. Release tag requires accepted local snapshot.
