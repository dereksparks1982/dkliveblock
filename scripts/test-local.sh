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
node --test tests/rules.test.js tests/background.test.js tests/privacy.test.js tests/subscriptions.test.js
echo 'PHASE PASS: Offline regression suite'
echo 'FINAL PASS: Local source checks; browser and video playback remain unverified'
