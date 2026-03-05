#!/usr/bin/env bash
# H.A.C.A Frontend Build Script
# Concatenates src/*.js in order and writes haca-panel.js with a content hash for cache-busting.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/src"
OUT="$SCRIPT_DIR/haca-panel.js"

MODULES=(
  config_tab.js
  core.js
  pagination.js
  history.js
  complexity.js
  optimizer.js
  ai_explain.js
  dep_graph.js
  battery.js
)

TMP=$(mktemp)
for mod in "${MODULES[@]}"; do
  echo "// ── $mod ──────────────────────────────────────────" >> "$TMP"
  cat "$SRC/$mod" >> "$TMP"
  echo "" >> "$TMP"
done

# Compute content hash (first 8 chars of SHA256) for cache-busting
HASH=$(sha256sum "$TMP" | cut -c1-8)
echo "// HACA-BUILD: $HASH  $(date -u +%Y-%m-%dT%H:%M:%SZ)" | cat - "$TMP" > "$OUT"
rm "$TMP"

echo "✅ haca-panel.js built — hash: $HASH  ($(wc -l < "$OUT") lines)"