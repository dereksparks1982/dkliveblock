# Build 84: restore complete local QA coverage and guard restricted player responses

**Version 0.3.54 (unreleased).**

## Changes

The local test runner listed 104 of the repository's 110 JavaScript suites. Its own inventory check would reject every complete run. All six missing suites have now been added to the capped two-worker Node regression phase, without GitHub Actions or a new dependency.

The existing end-to-end YouTube fixture was stale: it expected `/browse` to be blocked even though Builds 82–83 introduced bounded ad handling for that response. It now verifies the request is passed to the stream filter, a clearly labeled sponsored entry is removed, normal feed entries remain and turning filtering off restores native request blocking. The request counter is updated accordingly.

The network player JSON filter and the trusted page bridge now preserve explicitly denied **outer** playability responses without rewriting nested advertising metadata. This avoids pretending that removing an ad marker fixes a server-side playback refusal.

## Verification limits

The six-test inventory, static syntax and isolated normal/denied response checks were performed during direct GitHub editing. The complete Node/Python suite has not run in an Ubuntu checkout here, and actual Firefox/YouTube normal or movie-with-ads playback is not accepted. No ZIP, installer, release, workflow or user test request.
