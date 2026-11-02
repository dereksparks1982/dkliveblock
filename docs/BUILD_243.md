# Build 243 · v0.3.213: Company modules, beginning with Meta

Implemented a pure, local company/platform registry in `src/company-modules.js`. Meta is represented by Facebook, Instagram, Threads and WhatsApp domain families; YouTube is registered independently. This is an **organizational and detection-routing foundation**. A shared owner does not prove that every platform uses the same ad endpoints, and the Facebook DOM engine is deliberately not enabled on Instagram, Threads or WhatsApp.

Facebook's existing site-scoped detector now uses this registry when loaded. Existing YouTube player/ad machinery stays unchanged and can be migrated into a dedicated module without risk to accepted functionality.

Company research means only inspecting advertising signals and request metadata available in the extension's own browser context, locally and under user control. It is **not** covert access to company systems, unrelated accounts, private messages, cookies, credentials or cross-user tracking. Detection reports must distinguish observed evidence from speculation and should support deletion and exceptions.

**Next:** implement distinct Instagram/Threads detector adapters with real fixtures, classify Meta request endpoints by evidence, then connect local AI to review unresolved ad candidates. WhatsApp messaging must remain protected.

Targeted tests added; execution in real Firefox and the full Linux suite remain outstanding. Facebook automatic blocking has not yet passed owner acceptance. No GitHub Actions or extra dependencies.
