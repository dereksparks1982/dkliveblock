# Build 394 / v0.3.354: commercially reusable third-party provenance gate

**November 4, 2026. Development only, main branch.**

This gate turns the existing OSS integration policy into a repeatable offline check. Ghostery 2.20.3 (MPL-2.0), Facebook reference (MIT) and Mozilla PSL (MPL-2.0) already ship in DK Live Block. Source-integrity checks validate their licenses, references, known bundle digest, approved exact npm package versions and manifest integration order. Unreviewed new packages are rejected for human license review instead of automatically accepted.

The implementation uses only standard Node APIs and reads local source. It does not modify files, install packages, launch a browser, request permissions, contact external services or trigger GitHub Actions. Unit tests exercise successful provenance and failure for missing notices, changed hashes, unapproved dependencies and manifest drift.

This gate does not certify legal compliance or replace transitive dependency/list clearance. Full Linux tests and live Firefox verification remain pending. No public release.
