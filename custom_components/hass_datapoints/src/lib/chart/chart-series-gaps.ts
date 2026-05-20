/**
 * Pure series gap-splitting utilities extracted from history-chart.ts.
 *
 * All functions are stateless data transformations with no DOM or canvas dependency.
 */

// ── Gap segment types ──────────────────────────────────────────────────────

export interface GapSplitResult {
  segments: [number, number][][];
  gapBridges: [[number, number], [number, number]][];
  boundaryPoints: [number, number][];
}

// ── Split series by gaps ───────────────────────────────────────────────────

export function splitSeriesByGaps(
  pts: [number, number][],
  gapThresholdMs: number
): GapSplitResult {
  if (pts.length < 2 || !Number.isFinite(gapThresholdMs)) {
    return { segments: [pts], gapBridges: [], boundaryPoints: [] };
  }

  const segments: [number, number][][] = [];
  const gapBridges: [[number, number], [number, number]][] = [];
  let current: [number, number][] = [pts[0]];

  for (let i = 1; i < pts.length; i++) {
    const dt = pts[i][0] - pts[i - 1][0];
    if (dt > gapThresholdMs) {
      segments.push(current);
      gapBridges.push([pts[i - 1], pts[i]]);
      current = [pts[i]];
    } else {
      current.push(pts[i]);
    }
  }
  segments.push(current);

  const boundaryPoints: [number, number][] = gapBridges.flatMap(([a, b]) => [
    a,
    b,
  ]);

  return { segments, gapBridges, boundaryPoints };
}

// ── Build gap bridge color ─────────────────────────────────────────────────

export function buildGapBridgeColor(color: string): string {
  return color.startsWith("rgba")
    ? color.replace(/[\d.]+\)$/, "0.35)")
    : `${color}59`;
}

// ── Filter drawable comparison results ─────────────────────────────────────

export interface ComparisonResult {
  id: string;
  time_offset_ms: number;
  histResult: unknown;
  statsResult: unknown;
  label?: string;
}

export function filterDrawableComparisonResults(
  comparisonResults: ComparisonResult[],
  comparisonWindowIds: string[],
  selectedWindowId: string,
  hoveredWindowId: string
): ComparisonResult[] {
  const drawableIds = new Set(
    comparisonWindowIds.filter((id) => id.length > 0)
  );
  if (selectedWindowId) {
    drawableIds.add(selectedWindowId);
  }
  if (hoveredWindowId) {
    drawableIds.add(hoveredWindowId);
  }
  if (drawableIds.size === 0) {
    return [];
  }
  return comparisonResults.filter((window) =>
    drawableIds.has(String(window.id || ""))
  );
}
