/**
 * Pure scale computation utilities extracted from range-timeline.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import {
  addUnit,
  endOfUnit,
  type RangeUnit,
  startOfUnit,
} from "@/lib/timeline/timeline-scale";

// ── Estimate range label width ─────────────────────────────────────────────

export function estimateRangeLabelWidth(
  text: string,
  className: string,
  minGap: number
): number {
  const basePadding = className === "range-context-label" ? 20 : 14;
  const charWidth = className === "range-context-label" ? 8.2 : 7.2;
  return String(text).length * charWidth + basePadding + minGap;
}

// ── Compute range label stride ─────────────────────────────────────────────

export function computeRangeLabelStride(
  boundsMin: number,
  boundsMax: number,
  contentWidth: number,
  unit: RangeUnit,
  formatter: (d: Date) => string,
  className: string,
  minGap: number
): number {
  if (!contentWidth) return 1;
  const total = Math.max(1, boundsMax - boundsMin);
  let current = startOfUnit(new Date(boundsMin), unit);
  let previousMs: Nullable<number> = null;
  let minSpacingPx = Infinity;
  let maxLabelWidthPx = 0;
  let samples = 0;

  while (current.getTime() < boundsMax && samples < 24) {
    const currentMs = Math.max(current.getTime(), boundsMin);
    const text = formatter(current);
    maxLabelWidthPx = Math.max(
      maxLabelWidthPx,
      estimateRangeLabelWidth(text, className, minGap)
    );
    if (previousMs != null) {
      const spacingPx = ((currentMs - previousMs) / total) * contentWidth;
      if (spacingPx > 0) minSpacingPx = Math.min(minSpacingPx, spacingPx);
    }
    previousMs = currentMs;
    current = addUnit(current, unit, 1);
    samples += 1;
  }

  if (!Number.isFinite(minSpacingPx) || minSpacingPx <= 0) return 1;
  return Math.max(1, Math.ceil(maxLabelWidthPx / minSpacingPx));
}

// ── Get range unit anchor position ─────────────────────────────────────────

export function getRangeUnitAnchorMs(
  startTime: Date,
  unit: RangeUnit,
  boundsMin: number,
  boundsMax: number,
  anchor: "auto" | "center" | "start" = "auto"
): number {
  const unitStart = Math.max(
    startOfUnit(new Date(startTime), unit).getTime(),
    boundsMin
  );
  const unitEnd = Math.min(
    endOfUnit(new Date(startTime), unit).getTime(),
    boundsMax
  );
  let resolvedAnchor = anchor;
  if (resolvedAnchor === "auto") {
    resolvedAnchor = unit === "day" || unit === "week" ? "center" : "start";
  }
  if (resolvedAnchor === "center") {
    return unitStart + Math.max(0, (unitEnd - unitStart) / 2);
  }
  return unitStart;
}
