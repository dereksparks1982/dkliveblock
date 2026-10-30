#!/usr/bin/env bash
# DK Live Block local Ghostery installation. Does not close the terminal.
dk_install_ghostery() {
  local root
  root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)" || return 1
  cd "$root" || return 1
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    printf '%s\n' 'PHASE FAIL: Node.js and npm must be installed on Ubuntu.'
    return 1
  fi
  printf '%s\n' 'PHASE START: Install pinned Ghostery dependencies locally'
  if ! npm install --ignore-scripts --no-audit --no-fund --no-progress; then
    printf '%s\n' 'PHASE FAIL: npm unavailable. Existing extension remains unchanged.'
    return 1
  fi
  printf '%s\n' 'PHASE PASS: Dependencies installed'
  printf '%s\n' 'PHASE START: Compile and validate local Ghostery bundle'
  if ! node scripts/build-ghostery.mjs; then
    printf '%s\n' 'PHASE FAIL: Bundle could not be verified; old script preserved.'
    return 1
  fi
  printf '%s\n' 'FINAL PASS: Ghostery is bundled into local DK Live Block source.'
  printf '%s\n' 'No release ZIP, browser launch, hosted build or git push.'
}
dk_install_ghostery
