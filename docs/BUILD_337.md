# Build 337: rotating Facebook right-rail inspection

**Version:** 0.3.307. **Status:** source-only, unreleased.

The right-rail detector previously always inspected the first 260 headings, 5,500 labels and 220 attributed links on Facebook. Long React pages could hide later eligible ads from normal full scans. The same per-pass bounds now rotate, preserving rail geometry and Contacts protections. Read-only local diagnostic reports include only bounded numeric cursors.

Five regression checks cover advancing cursors, organic normal rail, export and empty lists. No permissions, telemetry, network/YouTube or website geometry changes. Full native Ubuntu/real Firefox acceptance pending.
