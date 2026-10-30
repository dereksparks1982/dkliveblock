# Build 51: fine-grained per-site cleanup exceptions

**Version 0.3.22 · UNRELEASED source · 30 October 2026**

## What changed

- **Cookie rejection:** one-click toolbar toggle to suspend automatic *reject optional cookies* action on a particular website, independent of browser-wide protection and regular ad filters.
- **Distraction cleanup:** second toolbar toggle to suspend automatic newsletter, survey and corner-ad overlay cleanup for the website, without stopping ad/tracker request filtering.
- A Settings section lists cookie and distraction exceptions independently and allows removing individual stored hostnames.
- Both features default on globally, and both per-site exception lists default **empty**; no exceptions are added automatically.
- Source website is derived from the **actual open HTTP(S) tab**, not a caller-provided URL, and page/content scripts cannot mutate the lists.
- Parent-domain exceptions apply to subdomains. Resuming from a child page removes relevant parent entries that cover it; unrelated sites remain unchanged.
- Each list has a 500-host cap, validation, storage persistence and defensive restoration after Firefox restarts.
- Rule engine, subscribed lists, global Acceptable Ads policy (none), video downloads, proxy/DNS and network request blocking are untouched.

## Testing and limitations

Focused background authorization, per-site independence and Settings UI regression fixtures are included. Full Node/Python suite and real Firefox runtime tests still pending. Actual consent-management platforms, multilingual labels and video/overlay false positives require live testing. There is no public release, GitHub Actions, executable package or downloaded patch.
