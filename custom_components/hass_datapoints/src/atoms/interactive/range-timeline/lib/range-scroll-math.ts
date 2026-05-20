/**
 * Pure math functions for range-timeline scroll management.
 *
 * All functions are stateless data transformations — no DOM dependency.
 */

import { clampNumber } from "@/lib/timeline/timeline-scale";

// ── Selection jump control visibility ─────────────────────────────────────

export interface JumpVisibility {
  showLeft: boolean;
  showRight: boolean;
}

/**
 * Determine whether the left/right "jump to selection" arrows should be shown.
 *
 * The left arrow is shown when the selection end is scrolled off the left edge;
 * the right arrow when the selection start is scrolled off the right edge.
 */
export function computeSelectionJumpVisibility(
  scrollLeft: number,
  viewportWidth: number,
  contentWidth: number,
  startTimeMs: number,
  endTimeMs: number,
  boundsMin: number,
  boundsMax: number
): JumpVisibility {
  const total = Math.max(1, boundsMax - boundsMin);
  const currentRight = scrollLeft + viewportWidth;
  const startPx = ((startTimeMs - boundsMin) / total) * contentWidth;
  const endPx = ((endTimeMs - boundsMin) / total) * contentWidth;
  return {
    showLeft: endPx < scrollLeft,
    showRight: startPx > currentRight,
  };
}

// ── Scroll position for range ─────────────────────────────────────────────

/**
 * Compute the target scrollLeft to bring a time range into view.
 *
 * With `center: true`, the midpoint of the range is centered in the viewport.
 * With `center: false`, the range start is aligned to the viewport start.
 *
 * Returns `null` when scrolling is not possible (viewport wider than content).
 */
export function computeScrollPositionForRange(
  rangeStartMs: number,
  rangeEndMs: number,
  boundsMin: number,
  boundsMax: number,
  contentWidth: number,
  viewportWidth: number,
  center: boolean
): number | null {
  if (!viewportWidth || contentWidth <= viewportWidth) return null;
  const totalMs = Math.max(1, boundsMax - boundsMin);
  const visibleSpanMs = totalMs * Math.min(1, viewportWidth / contentWidth);
  const maxScrollLeft = Math.max(0, contentWidth - viewportWidth);
  const viewportRangeMs = Math.max(0, totalMs - visibleSpanMs);
  if (viewportRangeMs <= 0) return null;

  const targetStart = center
    ? clampNumber(
        (rangeStartMs + rangeEndMs) / 2 - visibleSpanMs / 2,
        boundsMin,
        boundsMax - visibleSpanMs
      )
    : clampNumber(rangeStartMs, boundsMin, boundsMax - visibleSpanMs);

  const ratio = (targetStart - boundsMin) / viewportRangeMs;
  return clampNumber(ratio * maxScrollLeft, 0, maxScrollLeft);
}
