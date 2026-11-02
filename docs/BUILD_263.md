# Build 263 · v0.3.233 · Meta GraphQL response filtering and website link buttons

## GraphQL / JSONL ad-record filter

Adds a first-party `src/meta-graphql.js` response filter for Firefox MV2. It is a separate extension-owned module alongside existing YouTube response filtering, **not** a fork of uBlock's GPL-licensed scriptlets and not a second ad-blocker extension.

- Restricted to HTTPS `www.facebook.com` or `web.facebook.com`, exactly `/api/graphql` or `/api/graphql/`, POST `xmlhttprequest`, HTTP 200 and an already protected Facebook tab whose page origin is Facebook.
- Before attaching a stream, requires a single JSON/JavaScript MIME type, UTF-8 or unspecified charset, no conflicting Content-Length, no ranges, and an advertised size below 1.5 MB. Concurrent stream work is capped at 8 globally / 2 per tab and 4-second timeout.
- Parses a complete GraphQL JSON object or line-delimited JSON records with Facebook's `for (;;);` anti-JSON-hijacking prefix. Refuses unknown shapes and errors, and preserves unrelated line separators.
- Edits only the following explicitly bounded, labeled **ad entries**: `data.viewer.news_feed.edges` items with `category="SPONSORED"` or known ad typename; `data.viewer.sideFeedUnit.nodes[*].new_adverts.nodes` entries with `sponsored_data` or known ad typename; `data.serpResponse.results.edges` entries with known Marketplace advertising typename or role. Ordinary feed edges, unrelated objects, errors, authentication fields, and request data are preserved.
- For untouched responses, writes the original **byte chunks**. Timeout, invalid response, parse failure, oversized response or stream errors follow fail-open behavior. If a modified write fails after bytes might have been sent, disconnect rather than replay original content.
- New Settings switch, `metaGraphqlFilter`, defaults to **false until live Firefox acceptance**. It depends on existing DK enabled/ad-recognition settings, active tab and document/element exceptions. It is never applied to YouTube, Instagram, login endpoints or cross-origin responses.
- Added count-only `getMetaGraphqlStats` action restricted to extension interfaces and the selected live Facebook tab. A collapsed Meta Intelligence panel can display supported/enabled status and aggregate counts. No response bodies, cookies, profile names, passwords or full URLs are stored.

## Website button update
The owner requested that the three "More from Elderred Softworks" web-page links be real, matching buttons. Both `index.html` and `docs/index.html` now style them identically, keep buttons bottom-aligned, add focus styles, and preserve the existing card geometry. The available links are Hanafi Learning Deck, Folkhold and Capital & Consequence. Nougat Media Plus remains removed.

## Independent audit review and test hygiene
A third-party review of earlier builds highlighted lagging verification, main-frame document rule coverage, parser performance, and security-test failures. The current source was checked: `tests/redirect-resources.test.js` expected two inert redirect assets, while the manifest intentionally also exposes a distinct phishing warning page, `blocked.html`. This test now separately validates the two inert redirect assets and the static warning-page script reference. It is a contract update, **not proof of an exploit or of full security compliance**.

The manifest and `package.json` both carry `0.3.233`. A regression test file was added for GraphQL record shapes, unknown/malformed data, stream completion and eligibility. Eight isolated GraphQL/stream checks passed in a JavaScript simulation. The entire Node suite and actual Firefox request/response behavior remain **unverified**. The previous independent report claimed 13 failures; we do not call those fixed without reproducing the full suite.

## Acceptance gates
1. Run `scripts/test-local.sh` on a complete Ubuntu checkout, investigate all failures (especially security-contract tests) and record results.
2. Verify that enabling the GraphQL switch on a test Facebook session doesn't break login, scrolling, Marketplace, Contacts, Messenger, posting or media playback. Verify disabling it restores original responses.
3. Confirm an actual Facebook GraphQL advertising record matches one of the accepted schemas and is removed without dropping unrelated posts. The synthetic schema fixtures are not evidence that the current live Facebook schema uses them.
4. A/B YouTube playback against a known-good baseline before claiming cross-site stability.
5. Keep GraphQL filtering opt-in until these checks pass and provide a one-click disable option.

No GitHub Actions, unapproved UI rearrangements, external plugin runtime, paid advertising or telemetry introduced. Published website includes no Nougat link.
