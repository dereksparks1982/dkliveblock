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
check_ci_policy(){
 # Owner permits only exceptional, targeted CI. Reject accidental scheduled,
 # broad push-triggered, and unreviewed workflows in offline release checks.
 local folder=".github/workflows" file
 [[ -d "$folder" ]] || return 0
 while IFS= read -r -d '' file; do
  if [[ "$file" != "$folder/offline-verification.yml" ]]; then
   printf "Unreviewed GitHub Actions workflow: %s\n" "$file" >&2
   return 1
  fi
 done < <(find "$folder" -type f -print0)
 if [[ -f "$folder/offline-verification.yml" ]]; then
  if ! grep -Fq '  workflow_dispatch:' "$folder/offline-verification.yml" ||
     ! grep -Fq '      - ".github/workflows/offline-verification.yml"' "$folder/offline-verification.yml"; then
   printf "Offline verification must be manual or self-file-change-only.\n" >&2
   return 1
  fi
  if grep -Eq 'schedule:|pull_request:|upload-artifact|secrets\\.' "$folder/offline-verification.yml"; then
   printf "Offline verification has a disallowed trigger or artifact/secret use.\n" >&2
   return 1
  fi
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
 node scripts/nesty-evidence-lab.js || rc=1
 return "$rc"
}

run_phase "Restricted GitHub Actions policy" check_ci_policy
run_phase "Test-suite inventory" check_inventory
run_phase "JavaScript syntax" check_syntax
run_node_phase "Extension structure" node --test --test-reporter=tap --test-concurrency=2 tests/version-contract.test.js tests/vendor-reproducibility.test.js tests/streaming-preroll-regression.test.js tests/original-tab-guard.test.js tests/asset-integrity.test.js tests/test-local-runner.test.js tests/site-dashboard-model.test.js tests/site-dashboard-ui.test.js tests/block-details.test.js tests/threat-database.test.js tests/threat-warning.test.js tests/threat-warning-background.test.js tests/domain-investigation.test.js tests/allowed-activity.test.js tests/allowed-export.test.js tests/youtube-triage.test.js tests/youtube-outcome.test.js tests/youtube-lab.test.js tests/youtube-site-family-build313.test.js tests/youtube-manual-outcome-build314.test.js tests/youtube-selection-integrity-build319.test.js tests/session-export.test.js tests/blocked-export.test.js tests/rule-provenance.test.js tests/rule-evidence.test.js tests/icon-state.test.js tests/popup-dashboard-context.test.js tests/rdap-owner-background.test.js tests/dashboard-origin-background.test.js tests/navigation-integrity.test.js tests/content-fixture-contract.test.js tests/release.test.js tests/manifest.test.js tests/dependency-catalog.test.js tests/video-library.test.js tests/video-quality.test.js tests/video-auto-memory.test.js tests/streaming-diagnostics.test.js tests/streaming-repair.test.js tests/download-library.test.js tests/request-monitor.test.js tests/playback-health.test.js tests/request-controls.test.js tests/site-allowlist.test.js tests/filter-list-controls.test.js tests/language-lists.test.js tests/cosmetic-debug.test.js tests/cosmetic-debug-ui.test.js tests/cosmetic-exceptions.test.js tests/cosmetic-exceptions-ui.test.js tests/rule-validator.test.js tests/rule-validator-ui.test.js tests/notification-protection.test.js tests/notification-protection-ui.test.js tests/context-menu.test.js tests/element-picker.test.js tests/cbs-autoplay.test.js tests/cbs-compat.test.js tests/adaptive-model.test.js tests/adaptive-youtube.test.js tests/page-architect.test.js tests/options-back-to-top.test.js tests/ad-investigation.test.js tests/investigator-suite.test.js tests/browser-compat.test.js tests/devtools-panel.test.js tests/no-promotions.test.js tests/access-inspector-ui.test.js tests/popup-history.test.js tests/popup-trap.test.js tests/agent-nesty-build258.test.js tests/nesty-team-build275.test.js tests/nesty-integration-build281.test.js tests/nesty-integrity-build282.test.js tests/company-modules-build243.test.js tests/cookie-intelligence-build256.test.js tests/facebook-build242.test.js tests/facebook-build250.test.js tests/facebook-build252.test.js tests/facebook-build255.test.js tests/facebook-build260.test.js tests/facebook-build261.test.js tests/facebook-build262.test.js tests/facebook-fast-build280.test.js tests/meta-mutation-batch-build306.test.js tests/facebook-mutation-priority-build307.test.js tests/facebook-added-nodes-build309.test.js tests/facebook-label-priority-build311.test.js tests/facebook-organic-boundaries-build321.test.js tests/facebook-scan-fairness-build325.test.js tests/facebook-portal-tail-build326.test.js tests/facebook-russian-ads-build327.test.js tests/facebook-russian-segments-build328.test.js tests/facebook-english-segments-build330.test.js tests/facebook-cursor-report-build331.test.js tests/facebook-diagnostic-race-build332.test.js tests/meta-readonly-locale-build333.test.js tests/facebook-marketplace-fast-guard-build334.test.js tests/facebook-editor-descendant-build335.test.js tests/facebook-fast-label-tail-build336.test.js tests/facebook-rail-rotation-build337.test.js tests/facebook-marketplace-rotation-build338.test.js tests/facebook-priority-tail-build339.test.js tests/regression-fixture-contract-build340.test.js tests/checkpoint-extended-build341.test.js tests/facebook-extra-editor-guard-build342.test.js tests/facebook-last-insert-build343.test.js tests/facebook-viewport-priority-build357.test.js tests/facebook-unmarked-visible-build358.test.js tests/facebook-full-core-build359.test.js tests/facebook-core-lifecycle-build361.test.js tests/facebook-failclosed-build362.test.js tests/facebook-observer-lifecycle-build363.test.js tests/facebook-cost-diagnostics-build364.test.js tests/facebook-hide-reasons-build365.test.js tests/facebook-full-audit-build366.test.js tests/facebook-single-engine-build367.test.js tests/facebook-late-aria-build377.test.js tests/facebook-runtime-recovery-build378.test.js tests/facebook-runtime-diagnostics-build379.test.js tests/meta-strategy-nesty-build382.test.js tests/meta-hide-ownership-build384.test.js tests/meta-fallback-report-build385.test.js tests/facebook-rail-editor-build344.test.js tests/facebook-mobile-rotation-build345.test.js tests/facebook-hard-fallback-rotation-build346.test.js tests/facebook-portal-id-tail-build347.test.js tests/facebook-article-tail-build348.test.js tests/facebook-mobile-fast-guard-build349.test.js tests/facebook-evidence-tail-build350.test.js tests/facebook-sibling-tail-build351.test.js tests/facebook-anchor-tail-build352.test.js tests/facebook-bounds-audit-build353.test.js tests/youtube-lab-reset-race-build354.test.js tests/facebook-graphql-race-build355.test.js tests/extended-checkpoint-build356.test.js tests/facebook-linked-author-build298.test.js tests/facebook-rail-build253.test.js tests/facebook-rail-build264.test.js tests/facebook-rail-build265.test.js tests/facebook-vendor-build251.test.js tests/meta-agent-nesty-build266.test.js tests/orion-lifecycle-build267.test.js tests/orion-pause-build268.test.js tests/meta-orion-guards-build269.test.js tests/meta-orion-build272.test.js tests/meta-graphql-build270.test.js tests/meta-delivery-build254.test.js tests/meta-graphql-build263.test.js tests/meta-graphql-build264.test.js tests/meta-graphql-build265.test.js tests/meta-intelligence-build248.test.js tests/facebook-diagnostic-report-build305.test.js tests/facebook-triage-build310.test.js tests/facebook-locale-triage-build323.test.js tests/checkpoint-audit-build324.test.js tests/checkpoint-audit-build329.test.js tests/meta-module-build244.test.js tests/meta-provider-build246.test.js tests/project-links-build253.test.js tests/provider-adaptive-build244.test.js tests/provider-build249.test.js tests/provider-counts-build247.test.js tests/provider-observation-build245.test.js tests/scriptlet-facebook-build241.test.js tests/ui-language-build259.test.js tests/ui-language-build299.test.js tests/ui-language-build300.test.js tests/ui-language-build301.test.js tests/ui-language-build302.test.js tests/ui-language-build303.test.js tests/ui-language-build304.test.js tests/ui-language-build322.test.js tests/website-localization-build276.test.js tests/website-back-to-top-build298.test.js tests/website-education-hub.test.js
run_phase "Linux companion protocol regression" check_companion
run_node_phase "Offline regression suite" node --test --test-reporter=tap --test-concurrency=2 tests/ad-settings.test.js tests/ad-recognition.test.js tests/layout-reflow-build288.test.js tests/layout-reflow-build289.test.js tests/nesty-layout-build290.test.js tests/layout-geometry-build291.test.js tests/layout-preview-build292.test.js tests/layout-rollback-build293.test.js tests/layout-stale-cleanup-build315.test.js tests/layout-route-integrity-build316.test.js tests/layout-cleanup-scout-build317.test.js tests/layout-compare-pending-build318.test.js tests/layout-identity-build294.test.js tests/nesty-evidence-lab-build295.test.js tests/nesty-signal-limits-build312.test.js tests/youtube-player-enforcement-build296.test.js tests/youtube-player-pass-through-build297.test.js tests/ad-observer.test.js tests/qa-lab.test.js tests/engine-reuse.test.js tests/ghostery-embedded.test.js tests/ghostery-cosmetics.test.js tests/hybrid-engine.test.js tests/engine-verdict-audit.test.js tests/build-200-audit.test.js tests/youtube-experiment.test.js tests/engine-performance-audit.test.js tests/filter-coverage-audit.test.js tests/rules.test.js tests/engine-matcher-stream.test.js tests/reliability-contract.test.js tests/public-suffix.test.js tests/psl-license.test.js tests/background.test.js tests/popup-trap-background.test.js tests/request-monitor-background.test.js tests/request-controls-background.test.js tests/allowed-sites-background.test.js tests/allowed-sites-ui.test.js tests/site-cleanup-background.test.js tests/site-cleanup-ui.test.js tests/playback-health-background.test.js tests/playback-health-ui.test.js tests/popup-history-ui.test.js tests/privacy.test.js tests/subscriptions.test.js tests/manual-rules.test.js tests/consent.test.js tests/consent-dom.test.js tests/procedural.test.js tests/distractions.test.js tests/distractions-dom.test.js tests/anti-adblock.test.js tests/youtube-maintenance.test.js tests/youtube-background.test.js tests/youtube-feed.test.js tests/youtube-page-bridge.test.js tests/youtube-report.test.js tests/youtube-live-export-build308.test.js tests/youtube-compat-advice-build320.test.js tests/youtube-response.test.js tests/youtube-response-integration.test.js tests/redirect-resources.test.js tests/video-assist.test.js tests/streaming-watch.test.js tests/video-dom.test.js tests/anti-adblock-dom.test.js tests/overlay-observer.test.js tests/overlay-recovery.test.js tests/popup-guard.test.js tests/safe-scriptlet-rules.test.js tests/safe-scriptlet-runtime.test.js tests/auth-protection.test.js tests/auth-background.test.js tests/popup-refresh.test.js tests/paywall.test.js tests/paywall-dom.test.js tests/performance.test.js tests/cosmetic-performance.test.js tests/cosmetic-priority.test.js tests/ui-recovery.test.js tests/support.test.js tests/report.test.js tests/network-recovery.test.js tests/network-background.test.js tests/proxy-probe.test.js tests/security.test.js tests/list-io.test.js tests/subscription-cache.test.js tests/settings.test.js tests/subscription-integration.test.js
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
