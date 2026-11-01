#!/usr/bin/env bash
# Offline, Linux-only verification. Never starts browsers, CI, or downloads.
# Run every phase even after failures, and return nonzero if any phase failed.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

phase_names=()
phase_codes=()
failed_phases=0
node_tests=0
node_passed=0
node_failed=0
node_skipped=0
node_todo=0
node_cancelled=0
companion_executed=0
companion_failed=0

finish_phase(){
 local label="$1" code="$2"
 phase_names+=("$label"); phase_codes+=("$code")
 if (( code == 0 )); then
  printf "PHASE PASS: %s\n" "$label"
 else
  (( failed_phases += 1 ))
  printf "PHASE FAIL: %s (exit %s)\n" "$label" "$code" >&2
 fi
}
run_phase(){
 local label="$1" code=0
 shift
 printf "PHASE START: %s\n" "$label"
 "$@" || code=$?
 finish_phase "$label" "$code"
}
run_node_phase(){
 local label="$1" code=0 output="" count="" passed="" failed="" skipped="" todo="" cancelled=""
 shift
 printf "PHASE START: %s\n" "$label"
 output="$("$@" 2>&1)" || code=$?
 printf "%s\n" "$output"
 count="$(printf "%s\n" "$output" | sed -n 's/^# tests //p' | tail -n 1)"
 passed="$(printf "%s\n" "$output" | sed -n 's/^# pass //p' | tail -n 1)"
 failed="$(printf "%s\n" "$output" | sed -n 's/^# fail //p' | tail -n 1)"
 skipped="$(printf "%s\n" "$output" | sed -n 's/^# skipped //p' | tail -n 1)"
 todo="$(printf "%s\n" "$output" | sed -n 's/^# todo //p' | tail -n 1)"
 cancelled="$(printf "%s\n" "$output" | sed -n 's/^# cancelled //p' | tail -n 1)"
 if [[ "$count" =~ ^[0-9]+$ && "$passed" =~ ^[0-9]+$ && "$failed" =~ ^[0-9]+$ &&
       "$skipped" =~ ^[0-9]+$ && "$todo" =~ ^[0-9]+$ && "$cancelled" =~ ^[0-9]+$ ]] &&
    (( count == passed + failed + skipped + todo + cancelled )); then
  (( node_tests += count, node_passed += passed, node_failed += failed,
     node_skipped += skipped, node_todo += todo, node_cancelled += cancelled ))
  (( failed > 0 )) && code=1
 else
  printf "PHASE FAIL: Missing/inconsistent Node TAP test counts\n" >&2
  code=1
 fi
 finish_phase "$label" "$code"
}
check_no_actions(){
 if [[ -d .github/workflows ]] && find .github/workflows -type f -print -quit | grep -q .; then
  printf "GitHub Actions workflows are prohibited.\n" >&2
  return 1
 fi
 return 0
}
check_inventory(){
 local rc=0
 python3 scripts/test-suite-inventory-selftest.py || rc=1
 python3 scripts/test-suite-inventory.py || rc=1
 return "$rc"
}
check_syntax(){
 local file rc=0
 for file in src/*.js tests/*.js; do
  node --check "$file" || rc=1
 done
 return "$rc"
}
check_companion(){
 local script rc=0
 for script in \
  scripts/test-companion.py \
  scripts/test-verified-install.py \
  scripts/test-video-download.py \
  scripts/test-companion-package.py \
  scripts/test-download-jobs.py \
  scripts/test-download-library.py; do
  (( companion_executed += 1 ))
  if ! python3 "$script"; then
   (( companion_failed += 1 ))
   rc=1
   printf "COMPANION FAIL: %s\n" "$script" >&2
  fi
 done
 return "$rc"
}
check_release(){
 local rc=0
 python3 scripts/test-release-audit.py || rc=1
 python3 scripts/test-amo-preflight.py || rc=1
 python3 scripts/test-package-contents.py || rc=1
 python3 scripts/amo-preflight.py --report || rc=1
 python3 scripts/release-audit.py || rc=1
 node scripts/build-200-audit.js || rc=1
 return "$rc"
}

run_phase "GitHub Actions absence" check_no_actions
run_phase "Test-suite inventory" check_inventory
run_phase "JavaScript syntax" check_syntax
run_node_phase "Extension structure" node --test --test-reporter=tap --test-concurrency=2 tests/version-contract.test.js tests/vendor-reproducibility.test.js tests/streaming-preroll-regression.test.js tests/asset-integrity.test.js tests/test-local-runner.test.js tests/site-dashboard-model.test.js tests/site-dashboard-ui.test.js tests/block-details.test.js tests/threat-database.test.js tests/threat-warning.test.js tests/threat-warning-background.test.js tests/domain-investigation.test.js tests/allowed-activity.test.js tests/allowed-export.test.js tests/youtube-triage.test.js tests/youtube-outcome.test.js tests/youtube-lab.test.js tests/session-export.test.js tests/blocked-export.test.js tests/rule-provenance.test.js tests/rule-evidence.test.js tests/icon-state.test.js tests/popup-dashboard-context.test.js tests/rdap-owner-background.test.js tests/dashboard-origin-background.test.js tests/navigation-integrity.test.js tests/content-fixture-contract.test.js tests/release.test.js tests/manifest.test.js tests/dependency-catalog.test.js tests/video-library.test.js tests/video-quality.test.js tests/video-auto-memory.test.js tests/streaming-diagnostics.test.js tests/streaming-repair.test.js tests/download-library.test.js tests/request-monitor.test.js tests/playback-health.test.js tests/request-controls.test.js tests/site-allowlist.test.js tests/filter-list-controls.test.js tests/language-lists.test.js tests/cosmetic-debug.test.js tests/cosmetic-debug-ui.test.js tests/cosmetic-exceptions.test.js tests/cosmetic-exceptions-ui.test.js tests/rule-validator.test.js tests/rule-validator-ui.test.js tests/notification-protection.test.js tests/notification-protection-ui.test.js tests/context-menu.test.js tests/devtools-panel.test.js tests/no-promotions.test.js tests/access-inspector-ui.test.js tests/popup-history.test.js tests/popup-trap.test.js
run_phase "Linux companion protocol regression" check_companion
run_node_phase "Offline regression suite" node --test --test-reporter=tap --test-concurrency=2 tests/ad-settings.test.js tests/ad-recognition.test.js tests/ad-observer.test.js tests/qa-lab.test.js tests/engine-reuse.test.js tests/ghostery-embedded.test.js tests/ghostery-cosmetics.test.js tests/hybrid-engine.test.js tests/engine-verdict-audit.test.js tests/build-200-audit.test.js tests/youtube-experiment.test.js tests/engine-performance-audit.test.js tests/filter-coverage-audit.test.js tests/rules.test.js tests/engine-matcher-stream.test.js tests/reliability-contract.test.js tests/public-suffix.test.js tests/psl-license.test.js tests/background.test.js tests/popup-trap-background.test.js tests/request-monitor-background.test.js tests/request-controls-background.test.js tests/allowed-sites-background.test.js tests/allowed-sites-ui.test.js tests/site-cleanup-background.test.js tests/site-cleanup-ui.test.js tests/playback-health-background.test.js tests/playback-health-ui.test.js tests/popup-history-ui.test.js tests/privacy.test.js tests/subscriptions.test.js tests/manual-rules.test.js tests/consent.test.js tests/consent-dom.test.js tests/procedural.test.js tests/distractions.test.js tests/distractions-dom.test.js tests/anti-adblock.test.js tests/youtube-maintenance.test.js tests/youtube-background.test.js tests/youtube-feed.test.js tests/youtube-page-bridge.test.js tests/youtube-report.test.js tests/youtube-response.test.js tests/youtube-response-integration.test.js tests/redirect-resources.test.js tests/video-assist.test.js tests/streaming-watch.test.js tests/video-dom.test.js tests/anti-adblock-dom.test.js tests/overlay-observer.test.js tests/overlay-recovery.test.js tests/popup-guard.test.js tests/safe-scriptlet-rules.test.js tests/safe-scriptlet-runtime.test.js tests/auth-protection.test.js tests/auth-background.test.js tests/popup-refresh.test.js tests/paywall.test.js tests/paywall-dom.test.js tests/performance.test.js tests/cosmetic-performance.test.js tests/cosmetic-priority.test.js tests/ui-recovery.test.js tests/support.test.js tests/report.test.js tests/network-recovery.test.js tests/network-background.test.js tests/proxy-probe.test.js tests/security.test.js tests/list-io.test.js tests/subscription-cache.test.js tests/settings.test.js tests/subscription-integration.test.js
run_phase "Offline Firefox release audit" check_release

printf "\n=== DK Live Block offline test summary ===\n"
for (( i=0; i<${#phase_names[@]}; i++ )); do
 if (( phase_codes[i] == 0 )); then
  printf "PASS  %s\n" "${phase_names[i]}"
 else
  printf "FAIL  %s (exit %s)\n" "${phase_names[i]}" "${phase_codes[i]}"
 fi
done
printf "Node cases: %s total, %s passed, %s failed, %s skipped, %s todo, %s cancelled\n" \
 "$node_tests" "$node_passed" "$node_failed" "$node_skipped" "$node_todo" "$node_cancelled"
printf "Python companion scripts: %s executed, %s failed\n" "$companion_executed" "$companion_failed"
if (( failed_phases > 0 )); then
 printf "FINAL FAIL: %s of %s offline phases failed. Firefox/video playback remains unverified.\n" "$failed_phases" "${#phase_names[@]}" >&2
 exit 1
fi
printf "FINAL PASS: %s offline phases passed. Firefox/video playback remains unverified.\n" "${#phase_names[@]}"
