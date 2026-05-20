/**
 * Pure math functions for range-timeline pointer interactions.
 *
 * All functions are stateless data transformations — no DOM, no events.
 */

import type { RangeUnit } from "@/lib/timeline/timeline-scale";
import {
  clampNumber,
  snapDateToUnit,
  startOfUnit,
  endOfUnit,
  SECOND_MS,
  RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
  RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX,
} from "@/lib/timeline/timeline-scale";

// ── Coordinate → timestamp ────────────────────────────────────────────────

/**
 * Convert a horizontal client coordinate to a timeline timestamp.
 *
 * Returns `null` when the track rectangle has no width.
 */
export function timestampFromClientPosition(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
  boundsMin: number,
  boundsMax: number
): number | null {
  if (!rectWidth) return null;
  const ratio = clampNumber((clientX - rectLeft) / rectWidth, 0, 1);
  return boundsMin + ratio * (boundsMax - boundsMin);
}

// ── Selection drag delta ──────────────────────────────────────────────────

/**
 * Calculate the snapped time delta for a selection drag.
 */
export function computeSelectionDragDelta(
  currentTimestamp: number,
  startTimestamp: number,
  snapUnit: RangeUnit | null
): number {
  if (!snapUnit) return currentTimestamp - startTimestamp;
  const snappedStart = snapDateToUnit(
    new Date(startTimestamp),
    snapUnit
  ).getTime();
  const snappedCurrent = snapDateToUnit(
    new Date(currentTimestamp),
    snapUnit
  ).getTime();
  return snappedCurrent - snappedStart;
}

// ── Draft range for single handle ─────────────────────────────────────────

export interface DraftRange {
  startMs: number;
  endMs: number;
}

/**
 * Compute the new draft range after moving a single handle to `timestamp`.
 *
 * The timestamp is snapped and clamped to bounds, and the opposing handle
 * is preserved with a minimum separation of one snap span.
 */
export function computeDraftRangeForHandle(
  handle: "start" | "end",
  timestamp: number,
  currentStartMs: number,
  currentEndMs: number,
  boundsMin: number,
  boundsMax: number,
  snapUnit: RangeUnit | null,
  snapSpanMs: number
): DraftRange {
  let snappedTimestampMs = timestamp;
  if (snapUnit !== null) {
    snappedTimestampMs = snapDateToUnit(
      new Date(timestamp),
      snapUnit
    ).getTime();
  }
  const snapped = clampNumber(snappedTimestampMs, boundsMin, boundsMax);
  const minSpan = Math.max(snapSpanMs, SECOND_MS);
  let startMs = currentStartMs;
  let endMs = currentEndMs;
  if (handle === "start") {
    startMs = clampNumber(snapped, boundsMin, endMs - minSpan);
  } else {
    endMs = clampNumber(snapped, startMs + minSpan, boundsMax);
  }
  return { startMs, endMs };
}

// ── Shift both handles by delta ───────────────────────────────────────────

/**
 * Shift both handles by `deltaMs`, clamped so neither exceeds bounds.
 */
export function computeShiftedDraftRange(
  deltaMs: number,
  dragStartMs: number,
  dragEndMs: number,
  boundsMin: number,
  boundsMax: number
): DraftRange {
  const minDelta = boundsMin - dragStartMs;
  const maxDelta = boundsMax - dragEndMs;
  const clamped = clampNumber(deltaMs, minDelta, maxDelta);
  return {
    startMs: dragStartMs + clamped,
    endMs: dragEndMs + clamped,
  };
}

// ── Interval selection range ──────────────────────────────────────────────

/**
 * Compute the draft range from an interval selection (two pointer positions
 * snapped to unit boundaries).
 *
 * Returns `null` when the resulting range is empty.
 */
export function computeIntervalSelectionRange(
  startTimestamp: number,
  endTimestamp: number,
  unit: RangeUnit,
  boundsMin: number,
  boundsMax: number
): DraftRange | null {
  const startValue = Math.min(startTimestamp, endTimestamp);
  const endValue = Math.max(startTimestamp, endTimestamp);
  const rangeStart = clampNumber(
    startOfUnit(new Date(startValue), unit).getTime(),
    boundsMin,
    boundsMax
  );
  const rangeEnd = clampNumber(
    endOfUnit(new Date(endValue), unit).getTime(),
    boundsMin,
    boundsMax
  );
  if (rangeStart >= rangeEnd) return null;
  return { startMs: rangeStart, endMs: rangeEnd };
}

// ── Auto-scroll delta ─────────────────────────────────────────────────────

/**
 * Calculate the scroll delta for edge-proximity auto-scrolling during drag.
 *
 * Returns 0 when no scrolling is needed.
 */
export function computeAutoScrollDelta(
  clientX: number,
  viewportLeft: number,
  viewportRight: number
): number {
  const leftDistance = clientX - viewportLeft;
  const rightDistance = viewportRight - clientX;
  if (leftDistance < RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX) {
    const ratio = clampNumber(
      (RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX - leftDistance) /
        RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
      0,
      1
    );
    return -Math.max(
      1,
      Math.round(ratio * RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX)
    );
  }
  if (rightDistance < RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX) {
    const ratio = clampNumber(
      (RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX - rightDistance) /
        RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
      0,
      1
    );
    return Math.max(
      1,
      Math.round(ratio * RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX)
    );
  }
  return 0;
}

// ── Closest handle resolver ───────────────────────────────────────────────

/**
 * Determine which handle (`"start"` or `"end"`) is closer to the given timestamp.
 */
export function resolveCloserHandle(
  timestamp: number,
  startMs: number,
  endMs: number
): "start" | "end" {
  return Math.abs(timestamp - startMs) <= Math.abs(timestamp - endMs)
    ? "start"
    : "end";
}
