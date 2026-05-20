/**
 * Pure series-row utilities extracted from datapoints.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import {
  type HistorySeriesAnalysis,
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
} from "@/lib/domain/history-series";
import { COLORS } from "@/constants";

// ── Types ───────────────────────────────────────────────���──────────────────

export interface SeriesRow {
  entity_id: string;
  color: string;
  visible?: boolean;
  analysis?: HistorySeriesAnalysis;
}

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

function isValidRowIndex(
  index: number | undefined,
  length: number
): index is number {
  return (
    index !== undefined &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < length
  );
}

// ── Merge saved series rows ────────────────────────────────────────────────

export function mergeSavedSeriesRows(
  rows: unknown,
  savedRows: unknown
): SeriesRow[] {
  const normalizedRows = normalizeHistorySeriesRows(rows);
  const normalizedSavedRows = normalizeHistorySeriesRows(savedRows);
  if (!normalizedSavedRows.length) {
    return normalizedRows;
  }
  const savedRowMap = new Map(
    normalizedSavedRows.map((row) => [row.entity_id, row])
  );
  return normalizedRows.map((row) => {
    const savedRow = savedRowMap.get(row.entity_id);
    if (!savedRow) {
      return row;
    }
    return {
      ...row,
      color: savedRow.color,
      visible: savedRow.visible,
      analysis: savedRow.analysis,
    };
  });
}

// ── Add rows (merge + deduplicate) ────────────────────────────────────────

export function addSeriesRows(
  existingRows: SeriesRow[],
  entityIds: string[],
  preferredColors?: Record<string, string>
): SeriesRow[] {
  const merged = new Map<string, SeriesRow>(
    existingRows.map((row) => [row.entity_id, row])
  );
  entityIds.forEach((entityId, index) => {
    if (merged.has(entityId)) return;
    const preferred = preferredColors?.[entityId];
    merged.set(entityId, {
      entity_id: entityId,
      color:
        preferred && HEX_COLOR_RE.test(preferred)
          ? preferred
          : COLORS[(merged.size + index) % COLORS.length],
      visible: true,
      analysis: normalizeHistorySeriesAnalysis(null),
    });
  });
  return [...merged.values()];
}

// ── Update row color ──────────────────────────────────────────────────────

export function updateSeriesRowColor(
  rows: SeriesRow[],
  index: number | undefined,
  color: string | undefined
): SeriesRow[] | null {
  if (!isValidRowIndex(index, rows.length)) return null;
  if (typeof color !== "string" || !HEX_COLOR_RE.test(color)) return null;
  if (rows[index].color === color) return null;
  return rows.map((row, i) => (i === index ? { ...row, color } : row));
}

// ── Update row visibility ─────────────────────────────────────────────────

export function updateSeriesRowVisibility(
  rows: SeriesRow[],
  index: number | undefined,
  visible: unknown
): SeriesRow[] | null {
  if (!isValidRowIndex(index, rows.length)) return null;
  if (rows[index].visible === !!visible) return null;
  return rows.map((row, i) =>
    i === index ? { ...row, visible: !!visible } : row
  );
}

// ── Toggle analysis expanded ──────────────────────────────────────────────

export function toggleSeriesAnalysisExpanded(
  rows: SeriesRow[],
  entityId: string
): SeriesRow[] | null {
  const index = rows.findIndex((r) => r.entity_id === entityId);
  if (index === -1) return null;
  const row = rows[index];
  const current = normalizeHistorySeriesAnalysis(row.analysis);
  const next = normalizeHistorySeriesAnalysis({
    ...row.analysis,
    expanded: !current.expanded,
  });
  return rows.map((r, i) => (i === index ? { ...r, analysis: next } : r));
}

// ── Compute next analysis from option change ──────────────────────────────

export function computeNextAnalysis(
  currentAnalysis: HistorySeriesAnalysis,
  key: string,
  value: unknown
): HistorySeriesAnalysis | null {
  let nextKey = key;
  let nextValue = value;

  // Handle method toggle: add/remove a method from anomaly_methods array
  if (nextKey.startsWith("anomaly_method_toggle_")) {
    const method = nextKey.slice("anomaly_method_toggle_".length);
    const currentMethods = currentAnalysis.anomaly_methods;
    nextKey = "anomaly_methods";
    nextValue =
      nextValue === true
        ? [...new Set([...currentMethods, method])]
        : currentMethods.filter((m) => m !== method);
  }

  const nextSource: Record<string, unknown> = {
    ...currentAnalysis,
    [nextKey]: nextValue,
  };

  // Cascading option resets
  if (nextKey === "show_trend_lines" && nextValue !== true) {
    nextSource.show_trend_crosshairs = false;
  }
  if (nextKey === "show_threshold_analysis" && nextValue !== true) {
    nextSource.show_threshold_shading = false;
  }
  if (nextKey === "show_delta_analysis" && nextValue !== true) {
    nextSource.show_delta_tooltip = true;
    nextSource.show_delta_lines = false;
  }
  if (
    nextKey === "show_anomalies" &&
    nextValue === true &&
    (!Array.isArray(currentAnalysis.anomaly_methods) ||
      currentAnalysis.anomaly_methods.length === 0)
  ) {
    nextSource.anomaly_methods = ["trend_residual"];
  }

  const next = normalizeHistorySeriesAnalysis({
    ...nextSource,
    expanded: true,
  });
  if (JSON.stringify(next) === JSON.stringify(currentAnalysis)) return null;
  return next;
}

// ── Copy analysis to all rows ─────────────────────────────────────────────

export function copyAnalysisToAll(
  rows: SeriesRow[],
  sourceEntityId: string,
  sourceAnalysis: unknown
): SeriesRow[] | null {
  if (!sourceEntityId || !sourceAnalysis) return null;
  let changed = false;
  const result = rows.map((row) => {
    if (row.entity_id === sourceEntityId) return row;
    const current = normalizeHistorySeriesAnalysis(row.analysis);
    const next = normalizeHistorySeriesAnalysis({
      ...sourceAnalysis,
      expanded: current.expanded,
      anomaly_comparison_window_id: current.anomaly_comparison_window_id,
      anomaly_comparison_entity_id: current.anomaly_comparison_entity_id,
    });
    if (JSON.stringify(next) === JSON.stringify(current)) return row;
    changed = true;
    return { ...row, analysis: next };
  });
  return changed ? result : null;
}

// ── Remove row by index ───────────────────────────────────────────────────

export function removeSeriesRow(
  rows: SeriesRow[],
  index: number | undefined
): SeriesRow[] | null {
  if (!isValidRowIndex(index, rows.length)) return null;
  return rows.filter((_row, i) => i !== index);
}
