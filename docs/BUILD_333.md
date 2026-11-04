# Build 333: localized Meta review evidence

**Version:** 0.3.303. **Status:** source-only.

Extend only the existing read-only `meta-explicit-sponsored` reviewer to recognize `Реклама` and `Спонсировано`, matching the bounded Facebook detector vocabulary. It still reports fixed evidence categories and cannot independently hide, install rules or block requests. Broad body-text matches remain excluded.

Five tests verify exact label positives, organic negatives, fixed signals, Facebook-only scanner scope and version consistency. No network/player logic, permissions, telemetry, UI geometry or GraphQL switch changes. Live Firefox and full Ubuntu tests pending.
