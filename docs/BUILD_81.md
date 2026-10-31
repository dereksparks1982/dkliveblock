# Build 81: HTTP-method-aware request filtering

Version 0.3.51. Our independent parser recognizes the constrained `method=` restriction (GET, POST, HEAD, PUT, PATCH, DELETE, OPTIONS; pipe-separated positive and negated alternatives). Firefox request methods reach the native and Ghostery request object. Native method rules never match unknown request methods, and cannot affect page policy or query-parameter removal. This is not full ABP/uBO rule parity, and full on-device and Firefox testing remains outstanding. No GitHub Actions or release.
