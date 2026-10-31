# Build 108: feed array safety

Unreleased 0.3.78. The old YouTube feed filter verified only ad slots it planned to remove. But splice may also shift an adjacent editorial item, and inaccessible or nonconfigurable indices could interrupt one of several ad removals. The new validation checks all affected slots of every targeted array before making any changes. Frozen, sealed, sparse or accessor-backed arrays are left alone. No arbitrary page code, no media-byte modification. Full Firefox and offline suite acceptance remain outstanding.
