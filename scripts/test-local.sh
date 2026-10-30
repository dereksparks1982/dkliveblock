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
node --test tests/manifest.test.js tests/dependency-catalog.test.js tests/video-library.test.js tests/video-quality.test.js tests/video-auto-memory.test.js tests/streaming-diagnostics.test.js tests/streaming-repair.test.js tests/download-library.test.js tests/request-monitor.test.js tests/playback-health.test.js tests/request-controls.test.js tests/site-allowlist.test.js tests/filter-list-controls.test.js tests/language-lists.test.js tests/context-menu.test.js tests/devtools-panel.test.js tests/no-promotions.test.js tests/access-inspector-ui.test.js tests/popup-history.test.js tests/popup-trap.test.js
echo 'PHASE PASS: Extension structure'
echo 'PHASE START: Linux companion protocol regression'
python3 scripts/test-companion.py
python3 scripts/test-verified-install.py
python3 scripts/test-video-download.py
python3 scripts/test-companion-package.py
python3 scripts/test-download-jobs.py
python3 scripts/test-download-library.py
echo 'PHASE PASS: Linux companion protocol regression'
echo 'PHASE START: Offline regression suite'
node --test tests/ad-settings.test.js tests/ad-recognition.test.js tests/engine-reuse.test.js tests/ghostery-embedded.test.js tests/hybrid-engine.test.js tests/rules.test.js tests/public-suffix.test.js tests/psl-license.test.js tests/background.test.js tests/popup-trap-background.test.js tests/request-monitor-background.test.js tests/request-controls-background.test.js tests/allowed-sites-background.test.js tests/allowed-sites-ui.test.js tests/playback-health-background.test.js tests/playback-health-ui.test.js tests/popup-history-ui.test.js tests/privacy.test.js tests/subscriptions.test.js tests/manual-rules.test.js tests/consent.test.js tests/procedural.test.js tests/distractions.test.js tests/distractions-dom.test.js tests/anti-adblock.test.js tests/youtube-maintenance.test.js tests/youtube-background.test.js tests/video-assist.test.js tests/streaming-watch.test.js tests/video-dom.test.js tests/anti-adblock-dom.test.js tests/overlay-observer.test.js tests/overlay-recovery.test.js tests/popup-guard.test.js tests/auth-protection.test.js tests/auth-background.test.js tests/popup-refresh.test.js tests/paywall.test.js tests/paywall-dom.test.js tests/performance.test.js tests/cosmetic-performance.test.js tests/ui-recovery.test.js tests/support.test.js tests/report.test.js tests/network-recovery.test.js tests/network-background.test.js tests/proxy-probe.test.js tests/security.test.js tests/list-io.test.js tests/subscription-cache.test.js tests/settings.test.js tests/subscription-integration.test.js
echo 'PHASE PASS: Offline regression suite'
echo 'PHASE START: Offline Firefox release audit'
python3 scripts/release-audit.py
echo 'PHASE PASS: Offline release audit'
echo 'FINAL PASS: Local source checks; browser and video playback remain unverified'
