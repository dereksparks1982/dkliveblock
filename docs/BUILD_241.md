# Build 241 · v0.3.211: safe manual scriptlet and Facebook scan independence

- Added vetted manual `abort-on-property-read` syntax: `example.com##+js(abort-on-property-read, adCheck)`. It raises a ReferenceError when that explicitly named page JavaScript property is read, and restores its prior descriptor when disabled. It can break websites if used carelessly: no automatic rule enables it, including on Facebook.
- Preserved existing domain matching, explicit exceptions, no arbitrary expressions, protected names, bounded configuration and reversible MAIN-world property interception.
- Fixed the Facebook ad scan's dependency on the generic recognizer. If DKFacebookAds exists but DKAdRecognition is absent, Facebook scan still runs. Detection and hiding continue to require explicit ad evidence and the existing safety gates.
- Added targeted regression tests in `tests/scriptlet-facebook-build241.test.js`.
- **Validation status:** static review only in this environment; Node suite and live Firefox Facebook sponsored-feed acceptance were not run. Do not mark Facebook ad blocking complete until owner verifies it.
- No new permissions, GitHub Actions, third-party runtime dependencies, or packaging changes.
