# DK Live Block: feature and release gates

Status: UNRELEASED. Do not claim ABP feature parity or verified video ad blocking.

## Development slices
- [x] Public repository and project identity
- [ ] Independent blocking engine, page exceptions, element hiding, regression tests
- [ ] List subscriptions and automatic updates (EasyList, EasyPrivacy)
- [ ] Optional cookie, social and annoyance protection
- [ ] Per-site pause, rule picker, private bounded request logger
- [ ] Settings import/export and local privacy controls
- [ ] Advanced ABP filters, snippets, redirects and robust procedural cosmetics
- [ ] Public Suffix List, performance and security hardening
- [ ] Real Firefox/Ubuntu site tests, YouTube pre/mid-roll and Disney+ playback
- [ ] Mozilla signing and explicit release authorization

### Constraints
Never advertise a package for download before it meets the user's ABP-or-better requirement. Avoid misrepresenting unsupported filters as working. Keep video playback intact if an advertising rule would break the player.
