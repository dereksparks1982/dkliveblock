# Build 102: safe contains-text cosmetic aliases

Unreleased 0.3.72. Some filter lists use `domain.example##article:contains(Advert)` to identify explicitly labeled sponsored content. These rules now use the same bounded literal matcher as `:has-text` and support site exceptions. Generic no-domain usage, regex-like expressions and arbitrary script execution are still refused. Added parser, validator and matching fixtures. Full local/Firefox acceptance pending.
