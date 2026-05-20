/**
 * Pure comparison-window utilities extracted from datapoints.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import type { NormalizedHistoryDateWindow } from "@/lib/history-page/history-url-state";
import { parseDateValue } from "@/lib/domain/chart-zoom";
import { formatComparisonLabel } from "@/lib/domain/date-window";

// ── Active comparison window lookup ───────────────────────────────────────

export function getActiveComparisonWindow(
  windows: NormalizedHistoryDateWindow[],
  hoveredId: string | null | undefined,
  selectedId: string | null | undefined
): NormalizedHistoryDateWindow | null {
  if (hoveredId) {
    return windows.find((w) => w.id === hoveredId) || null;
  }
  if (selectedId) {
    return windows.find((w) => w.id === selectedId) || null;
  }
  return null;
}

// ── Comparison preview overlay ────────────────────────────────────────────

export interface ComparisonPreviewOverlay {
  label: string;
  window_range_label: string;
  actual_range_label: string;
}

export function getComparisonPreviewOverlay(
  activeWindow: NormalizedHistoryDateWindow | null,
  startTime: Date | null | undefined,
  endTime: Date | null | undefined
): ComparisonPreviewOverlay | null {
  if (!activeWindow || !startTime || !endTime) return null;
  const windowStart = parseDateValue(activeWindow.start_time);
  const windowEnd = parseDateValue(activeWindow.end_time);
  if (!windowStart || !windowEnd) return null;
  const actualSpanMs = endTime.getTime() - startTime.getTime();
  if (!Number.isFinite(actualSpanMs) || actualSpanMs <= 0) return null;
  const actualStart = new Date(windowStart.getTime());
  const actualEnd = new Date(windowStart.getTime() + actualSpanMs);
  const windowRangeLabel = formatComparisonLabel(windowStart, windowEnd);
  const actualRangeLabel = formatComparisonLabel(actualStart, actualEnd);
  if (windowRangeLabel === actualRangeLabel) return null;
  return {
    label: activeWindow.label || "Preview",
    window_range_label: windowRangeLabel,
    actual_range_label: actualRangeLabel,
  };
}

// ── Preview comparison windows ────────────────────────────────────────────

export interface ComparisonWindowWithOffset extends NormalizedHistoryDateWindow {
  time_offset_ms: number;
}

function addTimeOffsets(
  windows: NormalizedHistoryDateWindow[],
  startMs: number
): ComparisonWindowWithOffset[] {
  return windows
    .map((w) => ({
      ...w,
      time_offset_ms: new Date(w.start_time).getTime() - startMs,
    }))
    .filter((w) => Number.isFinite(w.time_offset_ms));
}

export function getPreviewComparisonWindows(
  windows: NormalizedHistoryDateWindow[],
  selectedId: string | null | undefined,
  hoveredId: string | null | undefined,
  startTime: Date | null | undefined
): ComparisonWindowWithOffset[] {
  if (!startTime) return [];
  const ids: string[] = [];
  if (selectedId) ids.push(selectedId);
  if (hoveredId && !ids.includes(hoveredId)) ids.push(hoveredId);
  if (!ids.length) return [];
  const matched = ids
    .map((id) => windows.find((w) => w.id === id) ?? null)
    .filter((w): w is NormalizedHistoryDateWindow => w !== null);
  return addTimeOffsets(matched, startTime.getTime());
}

// ── Preload comparison windows ────────────────────────────────────────────

export function getPreloadComparisonWindows(
  windows: NormalizedHistoryDateWindow[],
  startTime: Date | null | undefined
): ComparisonWindowWithOffset[] {
  if (!startTime) return [];
  return addTimeOffsets(windows, startTime.getTime());
}

// ── Date window shortcut ──────────────────────────────────────────────────

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Compute the next draft range after applying a shortcut shift.
 *
 * If the range aligns to a unit boundary, shifts by one unit in `direction`.
 * Otherwise, shifts by the raw span duration.
 *
 * Returns `null` if the input range is invalid.
 */
export function applyDateWindowShortcut(
  draftRange: DateRange | null | undefined,
  direction: number,
  getRoundedUnit: (start: Date, end: Date) => string | null,
  shiftByUnit: (date: Date, unit: string, amount: number) => Date,
  startOfUnitFn: (date: Date, unit: string) => Date,
  endOfUnitFn: (date: Date, unit: string) => Date
): DateRange | null {
  if (!draftRange) return null;
  const { start, end } = draftRange;
  if (!(start instanceof Date) || !(end instanceof Date) || !(start < end))
    return null;
  const roundedUnit = getRoundedUnit(start, end);
  if (roundedUnit) {
    const nextStart = startOfUnitFn(
      shiftByUnit(start, roundedUnit, direction),
      roundedUnit
    );
    const nextEnd = endOfUnitFn(nextStart, roundedUnit);
    return { start: nextStart, end: nextEnd };
  }
  const spanMs = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() + direction * spanMs),
    end: new Date(end.getTime() + direction * spanMs),
  };
}
