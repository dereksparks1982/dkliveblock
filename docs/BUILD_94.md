# Build 94: never turn read-only YouTube player objects into broken playback

Unreleased 0.3.64. The MAIN-world hook now inspects all candidate player ad metadata fields before deleting any, refusing the transformation when one is non-configurable. Unexpected object-level exceptions are confined to the hook: they must not reject a successful network fetch JSON/text response or abort XHR JSON access. Frozen bootstrap objects are retained unchanged. Tests cover frozen responses and mixed configurable/nonconfigurable fields. It does not attempt to disguise server-side playback denials, modify DRM or change media bytes.

Full Node/Python and live Firefox acceptance outstanding. No GitHub Actions, commands or public release.
