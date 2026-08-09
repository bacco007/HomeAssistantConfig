#!/usr/bin/env bash
# H.A.C.A Frontend Build Script
#
# Concatenates src/*.js in order and writes TWO files:
#   - haca-panel.js              (canonical, kept for back-compat / tools)
#   - haca-panel.<hash>.js       (the file actually loaded by the panel)
#
# The hashed filename is the cache-bust mechanism. Browsers and (more
# importantly) the HA frontend service worker cannot serve a stale copy of
# a URL that never existed in their cache. Query-string cache-bust
# (`?v=<hash>`) was unreliable across some users because the SW could
# intercept and ignore the query string.
#
# Old `haca-panel.<oldhash>.js` files in this directory are cleaned up so
# the integration folder doesn't accumulate dead artefacts.

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
  utils.js
  scan.js
  fixes.js
  reports.js
  issues.js
  battery.js
  battery_predict.js
  area_heatmap.js
  redundancy.js
  recorder_impact.js
  integrations.js
  closer.js
  compliance.js
  mcp_panel.js
)

TMP=$(mktemp)
for mod in "${MODULES[@]}"; do
  echo "// ── $mod ──────────────────────────────────────────" >> "$TMP"
  cat "$SRC/$mod" >> "$TMP"
  echo "" >> "$TMP"
done

# Compute content hash (first 8 chars of SHA256) for cache-busting
HASH=$(sha256sum "$TMP" | cut -c1-8)
HEADER="// HACA-BUILD: $HASH  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "$HEADER" | cat - "$TMP" > "$OUT"
rm "$TMP"

# Hashed copy — this is what custom_panel.py registers with HA.
HASHED_OUT="$SCRIPT_DIR/haca-panel.$HASH.js"
cp "$OUT" "$HASHED_OUT"

# Clean up older hashed bundles (any haca-panel.XXXXXXXX.js whose hash is
# not the current one). Matches exactly 8 hex chars between the dots so we
# don't touch anything else.
for old in "$SCRIPT_DIR"/haca-panel.*.js; do
  [ -e "$old" ] || continue
  base=$(basename "$old")
  # Match: haca-panel.<8 hex>.js
  if [[ "$base" =~ ^haca-panel\.[0-9a-f]{8}\.js$ ]] && [[ "$base" != "haca-panel.$HASH.js" ]]; then
    rm -f "$old"
    echo "🧹 removed stale bundle: $base"
  fi
done

echo "$HASH" > "$SCRIPT_DIR/haca-panel.hash"
echo "✅ haca-panel.js + haca-panel.$HASH.js built — hash: $HASH  ($(wc -l < "$OUT") lines)"
