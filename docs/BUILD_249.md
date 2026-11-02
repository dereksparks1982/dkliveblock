# Build 249 · v0.3.219: trustworthy provider observations

- Tightened provider hostname validation to reject invalid DNS label boundaries, overlong labels, numeric-only suffixes and unsafe host-like strings.
- Preserved previously observed allowed/blocked evidence when new observations arrive instead of overwriting earlier event types.
- Kept observations unverified regardless of repeated request traffic; accumulated counts do not establish a domain's purpose or ownership.
- Added regression fixtures covering malformed destinations, evidence union, bounded counters and immutable records.
- No extra permissions, UI redesign, automatic provider blocking, third-party runtime engines, or changes to working YouTube behavior.
- **Not yet verified:** full Node/Linux suite, real Firefox Facebook/Instagram functionality, complete adaptive automatic countermeasures.
