# Build 104: reliable case-independent tracking exceptions

Unreleased 0.3.74. Some websites capitalize UTM query keys differently from filter rules. During family-wide cleanup, previously the exception `removeparam=utm_source` would not protect `UTM_SOURCE`. Narrow UTM-only exception comparisons now use lowercase normalized keys, while unrelated parameter handling and existing signed-navigation protections are unchanged. Regression coverage added. Firefox and complete local suite acceptance remain open. No GitHub Actions or release.
