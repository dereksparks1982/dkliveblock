# Build 344: Facebook interactive right-rail safety

**Version:** 0.3.314. **Status:** source-only.

The feed, Marketplace and mobile detectors already refuse hiding active text input areas. Right-rail Sponsored sections and attribution-link cards were separately resolved and lacked the same protection. They now break out of section selection when a live editable descendant is present, and exclude editable ancestors before classifying a Sponsored label in the rail. Existing Contact and navigation safeguards remain.

Five tests include a synthetic editable rail section, normal rail positive, source checks for link/ancestor scopes and manifest consistency. Browser verification and full Ubuntu suite remain pending.
