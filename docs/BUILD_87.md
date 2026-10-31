# Build 87: response-filter regression reliability

The regression mock now reflects Firefox's stream-filter ownership: after the extension calls disconnect(), Firefox forwards the remaining bytes instead of delivering them through the detached extension's ondata callback. The previous mock incorrectly expected callbacks after disconnect and would falsely fail its large-response scenario. The new test still checks that every original byte survives, the stream exits exactly once, and normal and malformed responses remain unchanged where necessary. The dashboard/report label now reflects all YouTube JSON endpoint types, not just player requests.

Unreleased 0.3.57. Full Ubuntu suite and real Firefox playback not yet tested. No GitHub Actions, install, ZIP or release.
