# DK Live Block: optional Ghostery engine

The GitHub source contains a hybrid adapter, with a no-op vendor placeholder. Ghostery is NOT bundled or active until locally compiled. To build the pinned standalone MPL-2.0 @ghostery/adblocker@2.20.3 package on Ubuntu:

    npm install
    npm run build:ghostery

This compiles a self-contained src/ghostery-vendor.js. No runtime remote code, new network requests, or standalone Ghostery WebExtension listener are installed. DK site exceptions, playback protections, sign-in safeguards, local rule data, and proxy rules remain under DK control. Only Ghostery network matching is consulted. Remote scriptlets, rewrite instructions, network redirects and DOM injections are NOT enabled by this adapter.

MPL-2.0 license and upstream source: src/LICENSE-GHOSTERY.txt and https://github.com/ghostery/adblocker/tree/master/packages/adblocker . Include required source/notice information when distributing a binary. DK original code remains MIT. The source-only integration is not Firefox validated and not approved for public release.

No GitHub Actions or paid services. Building Ghostery is optional for development and does not block further coding.
