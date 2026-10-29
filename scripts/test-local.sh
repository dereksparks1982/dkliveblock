#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
echo 'PHASE START: GitHub Actions absence'
if [[ -d .github/workflows ]] && find .github/workflows -type f -print -quit | grep -q .; then
  echo 'PHASE FAIL: GitHub Actions workflow found' >&2
  exit 1
fi
echo 'PHASE PASS: No GitHub Actions'
echo 'PHASE START: JavaScript syntax'
for file in src/*.js tests/*.js; do node --check "$file"; done
echo 'PHASE PASS: JavaScript syntax'
echo 'PHASE START: Extension structure'
node --test tests/manifest.test.js
echo 'PHASE PASS: Extension structure'
echo 'PHASE START: Offline regression suite'
node --test tests/rules.test.js tests/background.test.js tests/privacy.test.js tests/subscriptions.test.js tests/manual-rules.test.js tests/consent.test.js tests/procedural.test.js tests/anti-adblock.test.js tests/anti-adblock-dom.test.js tests/overlay-observer.test.js tests/paywall.test.js tests/paywall-dom.test.js tests/performance.test.js tests/cosmetic-performance.test.js tests/network-recovery.test.js tests/network-background.test.js tests/proxy-probe.test.js tests/security.test.js tests/list-io.test.js tests/subscription-cache.test.js tests/settings.test.js tests/subscription-integration.test.js
echo 'PHASE PASS: Offline regression suite'
echo 'PHASE START: Offline Firefox release audit'
python3 scripts/release-audit.py
echo 'PHASE PASS: Offline release audit'
echo 'FINAL PASS: Local source checks; browser and video playback remain unverified'
